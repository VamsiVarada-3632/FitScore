import time
import anthropic
from fastapi import APIRouter
from models.response_models import HealthResponse
from core.config import get_settings
from core.embeddings import get_model

settings = get_settings()
router = APIRouter()
START_TIME = time.time()


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Health check — used by frontend and deployment platforms."""
    try:
        model = get_model()
        embedding_ok = model is not None
    except Exception:
        embedding_ok = False

    try:
        key = settings.anthropic_api_key
        anthropic_ok = bool(key) and len(key) > 10 and key != "sk-placeholder"
    except Exception:
        anthropic_ok = False

    return HealthResponse(
        status="ok" if embedding_ok else "degraded",
        version="1.0.0",
        embedding_model_loaded=embedding_ok,
        anthropic_reachable=anthropic_ok,
        uptime_seconds=round(time.time() - START_TIME, 1),
    )
