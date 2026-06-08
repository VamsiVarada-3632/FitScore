from pydantic import BaseModel, Field


class AnalysisConfig(BaseModel):
    include_suggestions: bool = True
    include_gap_analysis: bool = True
    max_keywords: int = Field(default=20, ge=5, le=50)
    truncate_resume_chars: int = Field(default=4000, ge=1000, le=10000)
    truncate_jd_chars: int = Field(default=3000, ge=500, le=8000)
