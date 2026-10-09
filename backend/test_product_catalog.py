import unittest

from backend.product_catalog import product_from_catalog


class ProductCatalogTests(unittest.TestCase):
    def test_uses_only_fields_from_matching_catalog_product(self):
        seed = {
            "id": 15,
            "brand": "Tentree",
            "sourceUrl": "https://www.tentree.com/products/mens-peru-embroidered-llama-hoodie-meteorite-black",
        }
        raw = {
            "handle": "mens-peru-embroidered-llama-hoodie-meteorite-black",
            "title": "Peru Embroidered Llama Hoodie",
            "product_type": "Mens",
            "body_html": "<p>A <strong>hoodie</strong> for everyday layering &amp; comfort.</p>",
            "images": [{"src": "https://cdn.shopify.com/image.jpg"}],
        }

        actual = product_from_catalog(seed, raw)

        self.assertEqual(actual, {
            "id": 15,
            "brand": "Tentree",
            "name": "Peru Embroidered Llama Hoodie",
            "category": "Mens",
            "description": "A hoodie for everyday layering & comfort.",
            "image": "/products/15.jpg",
            "sourceUrl": seed["sourceUrl"],
            "imageSourceUrl": "https://cdn.shopify.com/image.jpg",
        })

    def test_rejects_wrong_handle_or_missing_source_fields(self):
        seed = {"id": 1, "brand": "Cotopaxi", "sourceUrl": "https://www.cotopaxi.com/products/jacket"}
        raw = {"handle": "hoodie", "title": "Hoodie", "product_type": "Outerwear", "body_html": "<p>Warm</p>", "images": [{"src": "https://cdn.shopify.com/a.jpg"}]}
        with self.assertRaises(ValueError):
            product_from_catalog(seed, raw)
        raw["handle"] = "jacket"
        raw["body_html"] = ""
        with self.assertRaises(ValueError):
            product_from_catalog(seed, raw)

    def test_rejects_accessories_even_when_catalog_calls_them_apparel(self):
        seed = {"id": 1, "brand": "Cotopaxi", "sourceUrl": "https://www.cotopaxi.com/products/sun-hat"}
        raw = {"handle": "sun-hat", "title": "Orilla Sun Hat", "product_type": "Apparel", "body_html": "<p>Sun protection.</p>", "images": [{"src": "https://cdn.shopify.com/hat.jpg"}]}
        with self.assertRaisesRegex(ValueError, "Not a clothing product"):
            product_from_catalog(seed, raw)


if __name__ == "__main__":
    unittest.main()
