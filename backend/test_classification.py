import asyncio
import unittest
from unittest.mock import patch

from backend import app
from backend.models import ProductInput


class ClassificationLabelsTests(unittest.TestCase):
    def test_api_returns_english_labels_and_keeps_model_confidence(self):
        product = ProductInput(id=1, name="Jacket", category="Outerwear", description="Warm jacket")

        for internal, public in (("XUAN", "SPRING"), ("HA", "SUMMER"), ("THU", "AUTUMN"), ("DONG", "WINTER")):
            with self.subTest(internal=internal):
                agent = type("Agent", (), {"predict": lambda self, text, question: {
                    "answers": {"season": {"choice": internal, "probabilities": {internal: 0.75}}}
                }})()
                with patch.object(app, "is_ready", True), patch.object(app, "agent_instance", agent):
                    result = asyncio.run(app.classify_product(product))
                self.assertEqual(result.season, public)
                self.assertEqual(result.confidence, 0.75)
