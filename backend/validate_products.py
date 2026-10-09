"""Check that the displayed dataset and local images match the current catalogs."""

import hashlib
import json
from pathlib import Path

from PIL import Image

from backend.fetch_real_products import DATA, IMAGES, fetch_catalog
from backend.product_catalog import product_from_catalog


def main():
    manifest = json.loads((DATA / "products_manifest.json").read_text(encoding="utf-8"))
    products = manifest["products"]
    ts = (DATA / "products.ts").read_text(encoding="utf-8")
    display = json.loads(ts.split("export const PRODUCTS: ProductItem[] = ", 1)[1].rstrip(";\n"))
    if len(products) != 50 or manifest["totalProducts"] != 50 or {p["id"] for p in products} != set(range(1, 51)):
        raise AssertionError("Expected 50 unique product IDs")
    if len({p["sourceUrl"] for p in products}) != 50 or len({p["imageSourceUrl"] for p in products}) != 50:
        raise AssertionError("Duplicate source or image URL")
    if len(list(IMAGES.glob("*.jpg"))) != 50:
        raise AssertionError("Expected exactly 50 local images")

    catalogs = {brand: fetch_catalog(brand) for brand in ("Cotopaxi", "Tentree")}
    fields = ("id", "brand", "name", "category", "description", "image", "sourceUrl", "imageSourceUrl")
    for position, product in enumerate(products):
        handle = product["sourceUrl"].split("/products/")[-1]
        raw = catalogs[product["brand"]].get(handle)
        if raw is None or product_from_catalog(product, raw) != {key: product[key] for key in fields}:
            raise AssertionError(f"Catalog metadata mismatch at ID {product['id']}")
        if display[position] != {key: product[key] for key in fields}:
            raise AssertionError(f"Frontend metadata mismatch at ID {product['id']}")
        image_file = IMAGES / f"{product['id']}.jpg"
        content = image_file.read_bytes()
        if hashlib.sha256(content).hexdigest() != product["sha256"] or len(content) != product["sizeBytes"]:
            raise AssertionError(f"Image hash mismatch at ID {product['id']}")
        with Image.open(image_file) as image:
            image.verify()
        with Image.open(image_file) as image:
            if list(image.size) != product["dimensions"] or image.format != "JPEG":
                raise AssertionError(f"Invalid image at ID {product['id']}")
    print("Validated 50 catalog records, frontend records, and local images")


if __name__ == "__main__":
    main()
