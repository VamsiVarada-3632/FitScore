"""
FitScore AI — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""

import time
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import get_settings
from middleware.logging_middleware import configure_logging
from routers import score, analyze, suggest, health

settings = get_settings()
configure_logging(settings.log_level)
log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("starting_fitscore_api", env=settings.app_env)
    log.info("fitscore_api_ready")
    yield
    log.info("shutting_down_fitscore_api")


app = FastAPI(
    title="FitScore AI API",
    description="""
## FitScore AI — Resume × Job Description Match API

### Main Endpoint (use this from React frontend)
`POST /analyze/full` — Complete analysis: score + gap analysis + AI suggestions in one call.

### Individual Endpoints
- `POST /score/` — Match score + keywords (fast, no Claude, ~1s)
- `POST /analyze/` — Gap analysis only (Claude, ~5s)
- `POST /suggest/` — Rewrite suggestions only (Claude, ~6s)

### All endpoints accept `multipart/form-data`:
- `resume` — PDF file (max 10MB)
- `jd_text` — Job description as plain text string (min 50 chars)
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Error-Code", "X-Processing-Time"],
)


# ── Request logging ────────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    t_start = time.time()
    response = await call_next(request)
    elapsed = round((time.time() - t_start) * 1000)
    log.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=elapsed,
    )
    response.headers["X-Processing-Time"] = str(elapsed)
    return response


# ── Global exception handler ───────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("unhandled_exception", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "code": "INTERNAL_ERROR",
        },
    )


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(health.router,  prefix="/health",  tags=["Health"])
app.include_router(score.router,   prefix="/score",   tags=["Score"])
app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
app.include_router(suggest.router, prefix="/suggest", tags=["Suggest"])


@app.get("/", tags=["Root"])
def root():
    return {
        "status": "ok",
        "name": "FitScore AI API",
        "version": "1.0.0",
        "docs": "/docs",
        "main_endpoint": "POST /analyze/full",
    }
