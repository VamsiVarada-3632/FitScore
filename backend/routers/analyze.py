from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from core.matcher import run_analyze, run_full_analysis
from models.response_models import GapAnalysis, FullAnalysisResponse
from core.config import get_settings

settings = get_settings()
router = APIRouter()


def _validate(resume: UploadFile, jd_text: str) -> None:
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


@router.post("/", response_model=GapAnalysis)
async def analyze_resume(
    resume: UploadFile = File(..., description="PDF resume file"),
    jd_text: str = Form(..., description="Full job description text"),
):
    """Section-wise gap analysis via Claude. ~4-6s response time."""
    _validate(resume, jd_text)
    pdf_bytes = await resume.read()
    if len(pdf_bytes) > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_file_size_mb}MB limit.",
            headers={"X-Error-Code": "FILE_TOO_LARGE"},
        )
    try:
        return run_analyze(pdf_bytes, jd_text)
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
            headers={"X-Error-Code": "INVALID_PDF"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}",
            headers={"X-Error-Code": "ANALYSIS_ERROR"},
        )


@router.post("/full", response_model=FullAnalysisResponse)
async def full_analysis(
    resume: UploadFile = File(..., description="PDF resume file"),
    jd_text: str = Form(..., description="Full job description text"),
):
    """
    **Main endpoint — call this from the React frontend.**

    Returns complete analysis: score + gap analysis + AI suggestions in one request.
    Typical response time: 8-15 seconds (2 Claude calls + embedding computation).
    """
    _validate(resume, jd_text)
    pdf_bytes = await resume.read()
    if len(pdf_bytes) > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_file_size_mb}MB limit.",
            headers={"X-Error-Code": "FILE_TOO_LARGE"},
        )
    try:
        return run_full_analysis(pdf_bytes, resume.filename, jd_text)
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
            headers={"X-Error-Code": "INVALID_PDF"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Full analysis failed: {str(e)}",
            headers={"X-Error-Code": "ANALYSIS_ERROR"},
        )
