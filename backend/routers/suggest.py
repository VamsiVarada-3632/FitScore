from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from core.matcher import run_suggest
from models.response_models import SuggestionsResponse
from core.config import get_settings

settings = get_settings()
router = APIRouter()


@router.post("/", response_model=SuggestionsResponse)
async def suggest_rewrites(
    resume: UploadFile = File(..., description="PDF resume file"),
    jd_text: str = Form(..., description="Full job description text"),
):
    """AI-powered rewrite suggestions via Claude. ~5-8s response time."""
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
            headers={"X-Error-Code": "INVALID_FILE_TYPE"},
        )
    if len(jd_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short.",
            headers={"X-Error-Code": "JD_TOO_SHORT"},
        )

    pdf_bytes = await resume.read()
    if len(pdf_bytes) > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_file_size_mb}MB limit.",
            headers={"X-Error-Code": "FILE_TOO_LARGE"},
        )

    try:
        return run_suggest(pdf_bytes, jd_text)
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
            headers={"X-Error-Code": "INVALID_PDF"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Suggestions failed. Please try again.",
            headers={"X-Error-Code": "SUGGESTIONS_ERROR"},
        )
