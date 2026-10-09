import sys
import laya

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

agent = laya.load("convaiinnovations/laya-multilingual", device="cpu")

test_cases = [
    ("Áo khoác phao dáng dài", "Chất liệu phao chần bông 3 lớp dày cộm, chống gió và nước, giữ ấm nhiệt độ âm trong thời tiết rét buốt đại hàn tuyết rơi."),
    ("Áo thun cotton trơn", "Áo thun ngắn tay mỏng nhẹ, vải cotton co giãn thấm hút mồ hôi, chống nắng nóng oi ả ngày hè nắng gắt đi biển."),
    ("Váy voan hoa nhí dáng xòe", "Váy voan hoa nhí mềm mại nhẹ nhàng sắc hoa tươi tắn rực rỡ đón tết du xuân đầu năm mới."),
    ("Áo blazer dạ mỏng", "Áo khoác blazer dạ mỏng thanh lịch khoác ngoài se lạnh nhẹ nhàng ngày lá vàng rơi.")
]

candidates = [
    {
        "type": "choice",
        "instructions": "Trang phục này thích hợp nhất cho mùa nào trong năm?",
        "criteria": {
            "XUAN": "Mùa xuân: thời tiết đầu năm mát mẻ ấm áp, diện đồ du xuân hoa tươi nở rộ.",
            "HA": "Mùa hè: mùa hạ nóng nực oi bức đi biển, quần áo cộc tay mỏng nhẹ mát mẻ.",
            "THU": "Mùa thu: thời tiết se lạnh dịu mát, khoác nhẹ áo khoác mỏng, gió heo may.",
            "DONG": "Mùa đông: trời rét buốt đại hàn tuyết rơi, cần đồ dày giữ ấm giữ nhiệt cao."
        }
    }
]

for idx, q_def in enumerate(candidates):
    print(f"\n--- THỬ NGHIỆM CẤU TRÚC {idx+1} ---")
    for name, desc in test_cases:
        txt = f"Sản phẩm: {name}. Đặc điểm: {desc}"
        res = agent.predict(txt, {"q": q_def})["answers"]["q"]
        print(f"[{name}] -> {res['choice']} ({res['probabilities']})")
