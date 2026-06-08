from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ScoreResponse(BaseModel):
    match_score: float = Field(..., ge=0, le=100, description="Cosine similarity score 0-100")
    resume_word_count: int
    jd_word_count: int
    resume_char_count: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    score_label: str
    score_color: str
    processing_time_ms: int


class GapAnalysis(BaseModel):
    skills_gap: list[str]
    experience_gap: str
    education_gap: Optional[str] = None
    overall_summary: str
    ats_score_estimate: int = Field(..., ge=0, le=100)


class BulletImprovement(BaseModel):
    original: str
    improved: str


class SummaryRewrite(BaseModel):
    original: str
    improved: str


class SuggestionsResponse(BaseModel):
    summary_rewrite: SummaryRewrite
    bullet_improvements: list[BulletImprovement]
    keywords_to_add: list[str]
    tips: list[str]


class FullAnalysisResponse(BaseModel):
    """Unified response from POST /analyze/full — the main frontend endpoint."""
    analysis_id: str
    created_at: datetime
    filename: str
    jd_snippet: str
    role: str
    company: str
    score: ScoreResponse
    gap_analysis: GapAnalysis
    suggestions: SuggestionsResponse
    processing_time_ms: int


class HealthResponse(BaseModel):
    status: str
    version: str
    embedding_model_loaded: bool
    anthropic_reachable: bool
    uptime_seconds: float


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    code: str
