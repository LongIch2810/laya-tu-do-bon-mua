# Criteria cho 4 mùa trong năm dùng cho Laya AI Multilingual
SEASON_CRITERIA = {
    "XUAN": "áo khoác gió, áo mưa, áo măng tô, cardigan mỏng, đầm yếm, chống mưa phùn, nồm ẩm, du xuân, mùa xuân",
    "HA": "áo cộc tay, áo thun, quần short, mùa hè",
    "THU": "áo hoodie, áo sweater, se lạnh, mùa thu",
    "DONG": "áo phao, áo parka, lông vũ, rét đậm, mùa đông"
}

SEASON_QUESTION = {
    "season": {
        "type": "choice",
        "instructions": "Trang phục này thích hợp nhất cho mùa nào?",
        "criteria": SEASON_CRITERIA
    }
}

SEASON_LABELS = {
    "XUAN": "SPRING",
    "HA": "SUMMER",
    "THU": "AUTUMN",
    "DONG": "WINTER",
}
