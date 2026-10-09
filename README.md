# Laya – Tủ Đồ Bốn Mùa

**Ứng dụng AI phân loại quần áo theo mùa.**

Laya – Tủ Đồ Bốn Mùa là ứng dụng web tương tác minh họa cách AI gợi ý mùa phù hợp cho quần áo. Khi bắt đầu, ứng dụng lần lượt đưa **50 sản phẩm quần áo** từ catalog Cotopaxi và Tentree qua bộ quét AI, hiển thị mùa được dự đoán, độ tin cậy và thời gian xử lý, rồi xếp sản phẩm vào ô mùa tương ứng.

Ứng dụng dùng [Laya](https://github.com/NandhaKishorM/laya) với checkpoint **`convaiinnovations/laya-multilingual`** chạy cục bộ trên CPU qua FastAPI.

**Laya đóng góp gì?** Backend nạp mô hình khi khởi động và gửi tên, loại, mô tả của từng sản phẩm cùng tiêu chí bốn mùa cho Laya. Mô hình chọn mùa và trả xác suất của lựa chọn; FastAPI chuyển kết quả thành nhãn `SPRING`, `SUMMER`, `AUTUMN`, `WINTER`, còn giao diện hiển thị tên mùa bằng tiếng Việt. Tên, loại, mô tả và ảnh sản phẩm được lấy từ catalog Cotopaxi và Tentree, không phải do Laya tạo ra.

---

## 📸 Trải Nghiệm Visual Theo Chuẩn DESIGN.md (Framer Dark Canvas)
1. **Single-Screen Strictly No-Scroll:** Toàn bộ ứng dụng gói gọn hoàn hảo trong 1 màn hình (`100vh`), không có cuộn dọc hoặc ngang.
2. **Hệ Thống Màu Sắc & Typography:** Canvas đen `#090909`, thẻ than chì `Surface-1` (`#141414`), viền hairline `1px solid #262626`, nút bấm White Pill (`button-primary`) và Charcoal Pill (`button-secondary`), typography với negative tracking poster.
3. **Floating Control HUD:** Loại bỏ hoàn toàn Header cồng kềnh, tích hợp nút Bắt Đầu, Reset, Mute, Contact Sheet và trạng thái Laya vào thanh floating pill tối giản.
4. **Free-Fall Physics:** Thẻ trang phục rơi tự do từ đỉnh màn hình với gia tốc trọng lực vật lý thật và dừng tại tâm AI Scanner.
5. **AI Scanner & Real-Time Floating Chips:** Khung vi mạch tối giản quét tia laser xanh `#0099ff`; xung quanh liên tục bùng nổ các thẻ nổi (`◈ AI ANALYZING...`, `0.38s...`).
6. **Critical Hit / Healing Impact:** Khi backend trả kết quả, Floating Combat Text khổng lồ pop-up:
   - Icon mùa (🌸, ☀️, 🍂, ❄️).
   - Chữ `+1 <TÊN MÙA>` cỡ lớn với atmosphere gradient theo mùa.
   - Thống kê thực tế từ Laya: `CONFIDENCE: XX.X%` và `INFERENCE: XXXms`.
7. **Card Flight & Bin Impact:** Card bay theo đường cong vào ô mùa; ô mùa rung chấn nhận điểm, counter +1 và lưu thumbnail.
8. **Contact Sheet Inspector:** Trang `/preview` hiển thị lưới 50 sản phẩm thực tế, có thông số kỹ thuật, bộ lọc thương hiệu, link website gốc và link ảnh CDN.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
laya-tu-do-bon-mua/
├── backend/
│   ├── app.py                # FastAPI server, lifespan preload, CORS, routes
│   ├── models.py             # Pydantic schemas (ProductInput, ClassificationResult, HealthResponse)
│   ├── taxonomy.py           # Tiêu chí semantic 4 mùa cho Laya AI
│   ├── fetch_real_products.py# Script thu thập 50 sản phẩm từ Shopify catalog API
│   └── validate_products.py  # Script kiểm định tự động 5 tiêu chí dataset
├── frontend/
│   ├── DESIGN.md             # Tài liệu đặc tả thiết kế Framer Dark Canvas
│   ├── public/
│   │   └── products/         # 50 ảnh từ catalog gốc, chuẩn hóa 600x600 (1.jpg .. 50.jpg)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx    # Root layout & Metadata
│   │   │   ├── page.tsx      # Quản lý State Machine & luồng single-screen
│   │   │   ├── preview/      # Contact Sheet kiểm định 50 sản phẩm
│   │   │   │   └── page.tsx
│   │   │   └── globals.css   # Framer tokens, negative tracking, strict no-scroll
│   │   ├── components/
│   │   │   ├── ControlHUD.tsx# Floating Control HUD (thay thế Header)
│   │   │   ├── ProductCard.tsx # Thẻ sản phẩm chuẩn Framer than chì #141414
│   │   │   ├── AIScanner.tsx # Scanner laser beam tối giản
│   │   │   ├── FloatingCombatText.tsx # Hệ thống Combat Text game độc lập
│   │   │   ├── SeasonBins.tsx# 4 ô mùa ở chân trang với counter & thumbnail
│   │   │   └── CompletionModal.tsx # Bảng tổng kết vinh danh sau 50 món
│   │   ├── data/
│   │   │   ├── products.ts   # Dataset 50 sản phẩm TypeScript
│   │   │   └── products_manifest.json # Manifest tên, mô tả, URL nguồn, SHA256 ảnh
│   │   ├── lib/
│   │   │   ├── api.ts        # Client kết nối FastAPI (/api/health, /api/classify)
│   │   │   └── sound.ts      # Web Audio API Synth tạo âm thanh arcade game
│   │   └── types/
│   │       └── index.ts      # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── .venv/                    # Python virtual environment
└── README.md                 # Tài liệu hướng dẫn toàn diện
```

---

## 🛠️ Phiên Bản Dependencies Quan Trọng

### Backend
- **Python:** `3.11.x`
- **laya:** `0.4.1`
- **torch:** `2.14.1+cpu`
- **transformers:** `5.19.0`
- **fastapi:** `0.143.0`
- **uvicorn:** `0.54.0`
- **pydantic:** `2.14.0`
- **imagehash:** `4.3.2`
- **pillow:** `10.x`

### Frontend
- **Node.js:** `>= 18.x` (đã kiểm thử trên `v22.22.2`)
- **Next.js:** `16.4.0` (App Router, Turbopack)
- **React:** `19.x`
- **Tailwind CSS:** `v4`
- **framer-motion:** `^12.x`
- **lucide-react:** `^1.x`
- **canvas-confetti:** `^1.9.4`

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Trên Windows

### Chạy toàn bộ ứng dụng bằng Docker Compose

Tại thư mục gốc dự án, chạy một lệnh (cần Docker Engine đang hoạt động):

```powershell
docker compose up --build -d
```

Mở `http://127.0.0.1:3000` để dùng ứng dụng. Lần đầu backend cần tải và khởi động mô hình Laya nên trạng thái AI có thể chờ một lúc; cache mô hình được giữ trong Docker volume. `frontend/.env` cho phép đổi `NEXT_PUBLIC_API_URL`; nếu file này chưa có, Docker build dùng giá trị mẫu trong `frontend/.env.example`. Khi đổi URL, chạy lại lệnh trên để build frontend với giá trị mới.

Để dừng: `docker compose down`.

### Chạy trực tiếp không dùng Docker

### 1. Chuẩn Bị & Khởi Chạy Backend (FastAPI + Laya AI)

1. Mở PowerShell tại thư mục gốc dự án.

2. Kích hoạt môi trường Python ảo `.venv`:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

3. Chạy FastAPI backend:
   ```powershell
   python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --workers 1
   ```
   *Khi khởi động, FastAPI Lifespan sẽ tự động nạp mô hình `convaiinnovations/laya-multilingual` vào RAM và thực hiện 1 lượt warm-up inference. Khi thấy dòng:*
   ```text
   [INFO] ✅ LAYA AI MODEL ĐÃ SẴN SÀNG PHỤC VỤ REQUESTS!
   [INFO] Uvicorn running on http://127.0.0.1:8000
   ```
   *nghĩa là Backend đã sẵn sàng 100%.*

### 2. Khởi Chạy Frontend (Next.js)

1. Mở một cửa sổ PowerShell mới tại thư mục gốc dự án và di chuyển vào `frontend`:
   ```powershell
   cd .\frontend
   ```

2. Tạo `frontend/.env` từ `frontend/.env.example` và đặt `NEXT_PUBLIC_API_URL` thành địa chỉ backend mà trình duyệt truy cập được. URL này được đưa vào frontend khi build, nên cần build lại nếu thay đổi.
   ```powershell
   Copy-Item .env.example .env
   ```

3. Khởi chạy Next.js development server:
   ```powershell
   npm run dev -- -p 3000
   ```

4. Mở trình duyệt và truy cập:
   - 👉 Băng chuyền phân loại: **`http://localhost:3000`**
   - 👉 Contact sheet 50 sản phẩm: **`http://localhost:3000/preview`**

---

## 🔍 Kiểm Định Tự Động Dataset 50 Sản Phẩm

Làm mới 50 sản phẩm đã chọn từ catalog Cotopaxi và Tentree:
```powershell
python -m backend.fetch_real_products
```

Kiểm tra lại dữ liệu với catalog hiện tại và ảnh local:
```powershell
python -m backend.validate_products
```

Bộ kiểm định đối chiếu tên, loại, mô tả, URL sản phẩm và ảnh với từng bản ghi catalog; kiểm tra 50 ID, dữ liệu frontend, kích thước ảnh và SHA256. Dữ liệu gốc giữ nguyên tiếng Anh. Các thuộc tính không có trong catalog không được suy đoán thêm.
