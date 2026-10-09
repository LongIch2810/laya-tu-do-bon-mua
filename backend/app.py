import os
import sys
import time
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Tắt cảnh báo symlinks Windows của huggingface_hub
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

# Đảm bảo console Windows ghi log UTF-8 mượt mà
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("SeasonSorterBackend")

import laya
from backend.models import ProductInput, ClassificationResult, HealthResponse
from backend.taxonomy import SEASON_QUESTION, SEASON_LABELS

# Biến toàn cục giữ model agent
agent_instance = None
is_ready = False
startup_error = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent_instance, is_ready, startup_error
    logger.info("==================================================")
    logger.info("🚀 KHỞI ĐỘNG FASTAPI BACKEND - PRELOAD LAYA AI")
    logger.info("==================================================")
    t0 = time.perf_counter()
    try:
        # 1. Preload checkpoint multilingual
        logger.info("[1/2] Đang tải mô hình convaiinnovations/laya-multilingual trên CPU...")
        agent_instance = laya.load("convaiinnovations/laya-multilingual", device="cpu")
        load_time = time.perf_counter() - t0
        logger.info(f"-> Nạp mô hình vào bộ nhớ thành công trong {load_time:.2f}s!")

        # 2. Warm-up inference
        logger.info("[2/2] Đang thực hiện warm-up inference...")
        tw0 = time.perf_counter()
        # Dùng độ dài gần mô tả sản phẩm thật để lần quét đầu không chịu cold start.
        warmup_text = (
            "Sản phẩm: Áo khoác phao. Loại trang phục: Áo khoác. Đặc điểm chi tiết: "
            + "Áo khoác phao lót lông vũ 3 lớp giữ nhiệt cực tốt chống rét buốt mùa đông. " * 8
        )
        warmup_res = agent_instance.predict(warmup_text, SEASON_QUESTION)
        warmup_duration_ms = (time.perf_counter() - tw0) * 1000.0

        predicted_season = warmup_res["answers"]["season"]["choice"]
        logger.info(f"-> Warm-up hoàn tất thành công! Mẫu dự đoán: [{predicted_season}] ({warmup_duration_ms:.1f}ms)")
        is_ready = True
        logger.info("✅ LAYA AI MODEL ĐÃ SẴN SÀNG PHỤC VỤ REQUESTS!")
        logger.info("==================================================")
    except Exception as e:
        logger.error(f"❌ LỖI KHỞI ĐỘNG MODEL: {str(e)}", exc_info=True)
        startup_error = str(e)
        is_ready = False

    yield

    logger.info("🛑 Đang dọn dẹp và giải phóng tài nguyên FastAPI Backend...")
    agent_instance = None
    is_ready = False

app = FastAPI(
    title="Laya – Tủ Đồ Bốn Mùa API",
    version="1.0.0",
    lifespan=lifespan
)

# API công khai không dùng cookie; cho phép frontend ở mọi origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    if not is_ready:
        if startup_error:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Model initialization failed: {startup_error}"
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is still loading and warming up..."
        )
    return HealthResponse(
        status="ready",
        model="laya-multilingual",
        device="cpu"
    )

def _run_sync_inference(text: str):
    """Hàm chạy sync inference được đưa vào thread pool để không block event loop."""
    t_start = time.perf_counter()
    res = agent_instance.predict(text, SEASON_QUESTION)
    t_end = time.perf_counter()
    inference_ms = (t_end - t_start) * 1000.0
    return res, inference_ms

@app.post("/api/classify", response_model=ClassificationResult)
async def classify_product(product: ProductInput):
    if not is_ready or agent_instance is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Model is not ready yet."
        )

    # Tổng hợp văn bản miêu tả sản phẩm (không chứa nhãn mùa để đảm bảo AI suy luận trung thực)
    inference_text = (
        f"Sản phẩm: {product.name}. "
        f"Loại trang phục: {product.category}. "
        f"Đặc điểm chi tiết: {product.description}"
    )

    try:
        # Chạy inference trong worker thread
        raw_res, inference_ms = await asyncio.to_thread(_run_sync_inference, inference_text)

        season_ans = raw_res["answers"]["season"]
        chosen_season = season_ans.get("choice")

        # Trích xuất confidence từ probabilities
        probabilities = season_ans.get("probabilities", {})
        confidence = probabilities.get(chosen_season, None)

        logger.info(
            f"[ID {product.id:02d}] '{product.name[:25]}' -> "
            f"MÙA: {SEASON_LABELS[chosen_season]} | Confidence: {confidence*100 if confidence else 0:.1f}% | "
            f"Inference: {inference_ms:.1f}ms"
        )

        return ClassificationResult(
            id=product.id,
            season=SEASON_LABELS[chosen_season],
            confidence=confidence,
            inference_ms=round(inference_ms, 1)
        )
    except Exception as e:
        logger.error(f"Lỗi khi phân loại sản phẩm {product.id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )
