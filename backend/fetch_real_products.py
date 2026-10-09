"""Refresh the selected 50 products from their official Shopify catalogs."""

import hashlib
import io
import json
import os
import shutil
import tempfile
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageOps

from backend.product_catalog import product_from_catalog


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
DATA = FRONTEND / "src" / "data"
IMAGES = FRONTEND / "public" / "products"
HEADERS = {"User-Agent": "Mozilla/5.0"}


def fetch_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
        return json.load(response)


def fetch_catalog(brand):
    products = {}
    for page in (1, 2):
        url = f"https://www.{brand.lower()}.com/products.json?limit=250&page={page}"
        batch = fetch_json(url)["products"]
        products.update({item["handle"]: item for item in batch})
    return products


def image_bytes(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
        source = response.read()
    with Image.open(io.BytesIO(source)) as image:
        image.load()
        original_dimensions = list(image.size)
        rgba = image.convert("RGBA")
        canvas = Image.new("RGBA", rgba.size, "white")
        canvas.alpha_composite(rgba)
        square = ImageOps.pad(canvas.convert("RGB"), (600, 600), color="white")
        output = io.BytesIO()
        square.save(output, format="JPEG", quality=90, optimize=True)
    return output.getvalue(), original_dimensions


def main():
    seed = json.loads((DATA / "products_manifest.json").read_text(encoding="utf-8"))["products"]
    if len(seed) != 50 or {item["id"] for item in seed} != set(range(1, 51)):
        raise ValueError("Expected the existing 50 unique product IDs")
    if len({item["sourceUrl"] for item in seed}) != 50:
        raise ValueError("Duplicate source URL")

    catalogs = {brand: fetch_catalog(brand) for brand in ("Cotopaxi", "Tentree")}
    products = []
    hashes = set()
    with tempfile.TemporaryDirectory(dir=FRONTEND) as scratch:
        stage = Path(scratch)
        image_dir = stage / "products"
        image_dir.mkdir()
        for item in sorted(seed, key=lambda entry: entry["id"]):
            handle = item["sourceUrl"].split("/products/")[-1]
            raw = catalogs[item["brand"]].get(handle)
            if raw is None:
                raise ValueError(f"Missing catalog product: {item['sourceUrl']}")
            product = product_from_catalog(item, raw)
            content, original_dimensions = image_bytes(product["imageSourceUrl"])
            digest = hashlib.sha256(content).hexdigest()
            if digest in hashes:
                raise ValueError(f"Duplicate product image: {item['id']}")
            hashes.add(digest)
            (image_dir / f"{item['id']}.jpg").write_bytes(content)
            products.append({**product, "originalDimensions": original_dimensions, "dimensions": [600, 600], "sizeBytes": len(content), "sha256": digest})
            print(f"[{item['id']:02d}/50] {product['name']}")

        manifest = {
            "datasetVersion": "3.0.0",
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "totalProducts": len(products),
            "sources": ["https://www.cotopaxi.com", "https://www.tentree.com"],
            "products": products,
        }
        (stage / "products_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        display_fields = ("id", "brand", "name", "category", "description", "image", "sourceUrl", "imageSourceUrl")
        display = [{key: product[key] for key in display_fields} for product in products]
        (stage / "products.ts").write_text(
            "import { ProductItem } from '@/types';\n\nexport const PRODUCTS: ProductItem[] = "
            + json.dumps(display, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8"
        )

        old_images = stage / "old_products"
        old_manifest = stage / "old_manifest.json"
        old_ts = stage / "old_products.ts"
        shutil.copy2(DATA / "products_manifest.json", old_manifest)
        shutil.copy2(DATA / "products.ts", old_ts)
        try:
            IMAGES.rename(old_images)
            image_dir.rename(IMAGES)
            os.replace(stage / "products_manifest.json", DATA / "products_manifest.json")
            os.replace(stage / "products.ts", DATA / "products.ts")
        except Exception:
            if old_images.exists():
                if IMAGES.exists():
                    shutil.rmtree(IMAGES)
                old_images.rename(IMAGES)
            shutil.copy2(old_manifest, DATA / "products_manifest.json")
            shutil.copy2(old_ts, DATA / "products.ts")
            raise
    print("Refreshed 50 products from the official catalogs")


if __name__ == "__main__":
    main()
