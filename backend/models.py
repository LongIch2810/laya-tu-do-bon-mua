from pydantic import BaseModel
from typing import Literal, Optional

class ProductInput(BaseModel):
    id: int
    name: str
    category: str
    description: str

class ClassificationResult(BaseModel):
    id: int
    season: Literal["SPRING", "SUMMER", "AUTUMN", "WINTER"]
    confidence: Optional[float] = None
    inference_ms: float

class HealthResponse(BaseModel):
    status: str
    model: str
    device: str
