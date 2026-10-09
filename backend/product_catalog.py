import re
from html.parser import HTMLParser
from urllib.parse import urlparse


class _Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def product_from_catalog(seed, raw):
    url = urlparse(seed["sourceUrl"])
    handle = url.path.removeprefix("/products/")
    if url.hostname != f"www.{seed['brand'].lower()}.com" or not handle or raw.get("handle") != handle:
        raise ValueError(f"Product source mismatch: {seed['sourceUrl']}")

    title = raw.get("title") or ""
    if (not re.search(r"jacket|parka|puffer|pant|short|shirt|tee|tank|hoodie|sweater|cardigan|pullover|crew|flannel|trench|windbreaker|jumpsuit|overall|dress|skirt|skort|romper|henley|v-neck", title, re.I)
            or re.search(r"\b(?:hats?|beanies?|scarves?|gloves?|mittens?|socks?|shoes?|sandals?|bags?|totes?|backpacks?|bottles?|belts?|caps?)\b", title, re.I)):
        raise ValueError(f"Not a clothing product: {seed['sourceUrl']}")

    parser = _Text()
    parser.feed(raw.get("body_html") or "")
    description = re.sub(r"\s+", " ", " ".join(parser.parts)).strip()
    image_url = (raw.get("images") or [{}])[0].get("src")
    if not description or not image_url or not image_url.startswith("https://"):
        raise ValueError(f"Incomplete catalog product: {seed['sourceUrl']}")

    return {
        "id": seed["id"],
        "brand": seed["brand"],
        "name": title,
        "category": raw.get("product_type") or "",
        "description": description,
        "image": f"/products/{seed['id']}.jpg",
        "sourceUrl": seed["sourceUrl"],
        "imageSourceUrl": image_url,
    }
