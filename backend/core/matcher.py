"""
Orchestration layer — combines preprocessor, embeddings, keywords, and Claude.
All routers call these functions.
"""

import time
import uuid
from datetime import datetime

from core.preprocessor import parse_resume, parse_jd
from core.embeddings import compute_similarity
from core.keywords import find_missing_keywords, find_matched_keywords, score_label
from core.claude_client import run_gap_analysis, run_suggestions
from models.response_models import (
    ScoreResponse,
    GapAnalysis,
    SuggestionsResponse,
    FullAnalysisResponse,
    BulletImprovement,
    SummaryRewrite,
)


def run_score(resume_bytes: bytes, jd_text: str) -> ScoreResponse:
    """Score endpoint: fast cosine similarity + keyword diff. No Claude calls."""
    t_start = time.time()

    parsed_resume = parse_resume(resume_bytes)
    parsed_jd = parse_jd(jd_text)

    score = compute_similarity(parsed_resume.full_text, parsed_jd.full_text)
    missing = find_missing_keywords(parsed_resume.full_text, parsed_jd.full_text)
    matched = find_matched_keywords(parsed_resume.full_text, parsed_jd.full_text)
    label, color = score_label(score)

    elapsed = int((time.time() - t_start) * 1000)

    return ScoreResponse(
        match_score=score,
        resume_word_count=parsed_resume.word_count,
        jd_word_count=parsed_jd.word_count,
        resume_char_count=parsed_resume.char_count,
        matched_keywords=matched,
        missing_keywords=missing,
        score_label=label,
        score_color=color,
        processing_time_ms=elapsed,
    )


def run_analyze(resume_bytes: bytes, jd_text: str) -> GapAnalysis:
    """Analyze endpoint: gap analysis via Claude."""
    parsed_resume = parse_resume(resume_bytes)
    parsed_jd = parse_jd(jd_text)
    missing = find_missing_keywords(parsed_resume.full_text, parsed_jd.full_text)
    matched = find_matched_keywords(parsed_resume.full_text, parsed_jd.full_text)

    result = run_gap_analysis(
        resume_text=parsed_resume.full_text,
        jd_text=parsed_jd.full_text,
        resume_keywords=matched,
        missing_keywords=missing,
    )

    return GapAnalysis(**result)


def run_suggest(resume_bytes: bytes, jd_text: str) -> SuggestionsResponse:
    """Suggest endpoint: rewrite suggestions via Claude."""
    parsed_resume = parse_resume(resume_bytes)
    parsed_jd = parse_jd(jd_text)
    missing = find_missing_keywords(parsed_resume.full_text, parsed_jd.full_text)
    matched = find_matched_keywords(parsed_resume.full_text, parsed_jd.full_text)

    result = run_suggestions(
        resume_text=parsed_resume.full_text,
        jd_text=parsed_jd.full_text,
        matched_keywords=matched,
        missing_keywords=missing,
    )

    return SuggestionsResponse(
        summary_rewrite=SummaryRewrite(**result["summary_rewrite"]),
        bullet_improvements=[
            BulletImprovement(**b) for b in result["bullet_improvements"]
        ],
        keywords_to_add=result["keywords_to_add"],
        tips=result["tips"],
    )


def run_full_analysis(
    resume_bytes: bytes, filename: str, jd_text: str
) -> FullAnalysisResponse:
    """
    Main endpoint — called by the React frontend.
    Runs score + gap analysis + suggestions, returns unified FullAnalysisResponse.
    """
    t_start = time.time()

    parsed_resume = parse_resume(resume_bytes)
    parsed_jd = parse_jd(jd_text)

    score = compute_similarity(parsed_resume.full_text, parsed_jd.full_text)
    missing = find_missing_keywords(parsed_resume.full_text, parsed_jd.full_text)
    matched = find_matched_keywords(parsed_resume.full_text, parsed_jd.full_text)
    label, color = score_label(score)

    score_resp = ScoreResponse(
        match_score=score,
        resume_word_count=parsed_resume.word_count,
        jd_word_count=parsed_jd.word_count,
        resume_char_count=parsed_resume.char_count,
        matched_keywords=matched,
        missing_keywords=missing,
        score_label=label,
        score_color=color,
        processing_time_ms=0,
    )

    gap_raw = run_gap_analysis(
        resume_text=parsed_resume.full_text,
        jd_text=parsed_jd.full_text,
        resume_keywords=matched,
        missing_keywords=missing,
    )
    gap_resp = GapAnalysis(**gap_raw)

    suggest_raw = run_suggestions(
        resume_text=parsed_resume.full_text,
        jd_text=parsed_jd.full_text,
        matched_keywords=matched,
        missing_keywords=missing,
    )
    suggest_resp = SuggestionsResponse(
        summary_rewrite=SummaryRewrite(**suggest_raw["summary_rewrite"]),
        bullet_improvements=[
            BulletImprovement(**b) for b in suggest_raw["bullet_improvements"]
        ],
        keywords_to_add=suggest_raw["keywords_to_add"],
        tips=suggest_raw["tips"],
    )

    total_ms = int((time.time() - t_start) * 1000)
    score_resp.processing_time_ms = total_ms

    return FullAnalysisResponse(
        analysis_id=str(uuid.uuid4()),
        created_at=datetime.utcnow(),
        filename=filename,
        jd_snippet=parsed_jd.full_text[:120],
        role=parsed_jd.inferred_role,
        company=parsed_jd.inferred_company,
        score=score_resp,
        gap_analysis=gap_resp,
        suggestions=suggest_resp,
        processing_time_ms=total_ms,
    )
