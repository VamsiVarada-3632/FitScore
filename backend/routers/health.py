import time
from fastapi import APIRouter
from models.response_models import HealthResponse
from core.config import get_settings
settings = get_settings()
router = APIRouter()
START_TIME = time.time()


@router.get("/", response_model=HealthResponse)
async def health_check():
    embedding_ok = True  # lightweight scorer is always ready

    try:
        gemini_ok = (
            bool(settings.gemini_api_key)
            and len(settings.gemini_api_key) > 10
            and settings.gemini_api_key != "placeholder"
            and settings.gemini_api_key != "your_gemini_api_key_here"
        )
    except Exception:
        gemini_ok = False

    return HealthResponse(
        status="ok" if embedding_ok and gemini_ok else "degraded",
        version="1.0.0",
        embedding_model_loaded=embedding_ok,
        anthropic_reachable=gemini_ok,
        uptime_seconds=round(time.time() - START_TIME, 1),
    )
