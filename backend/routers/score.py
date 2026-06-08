from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from core.matcher import run_score
from models.response_models import ScoreResponse
from core.config import get_settings

settings = get_settings()
router = APIRouter()


@router.post("/", response_model=ScoreResponse)
async def score_resume(
    resume: UploadFile = File(..., description="PDF resume file"),
    jd_text: str = Form(..., description="Full job description text"),
):
    """Fast match score + keyword diff. No Claude calls — returns in ~1s."""
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
            headers={"X-Error-Code": "INVALID_FILE_TYPE"},
        )
    if len(jd_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please paste the full JD.",
            headers={"X-Error-Code": "JD_TOO_SHORT"},
        )
    if len(jd_text) > settings.max_jd_chars:
        raise HTTPException(
            status_code=400,
            detail=f"Job description exceeds {settings.max_jd_chars} characters.",
            headers={"X-Error-Code": "JD_TOO_LONG"},
        )

    pdf_bytes = await resume.read()
    if len(pdf_bytes) > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_file_size_mb}MB limit.",
            headers={"X-Error-Code": "FILE_TOO_LARGE"},
        )

    try:
        return run_score(pdf_bytes, jd_text)
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
            headers={"X-Error-Code": "INVALID_PDF"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Scoring failed. Please try again.",
            headers={"X-Error-Code": "SCORING_ERROR"},
        )
