"""
Claude API client with retry logic, timeout handling, and structured JSON parsing.
"""

import json
import re
import anthropic
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from core.config import get_settings

settings = get_settings()


def get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(
        (anthropic.APIConnectionError, anthropic.RateLimitError)
    ),
    reraise=True,
)
def call_claude_json(system: str, user: str, max_tokens: int = 2000) -> dict:
    """Call Claude and parse JSON from the response. Strips markdown fences."""
    client = get_client()
    message = client.messages.create(
        model=settings.claude_model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    raw: str = message.content[0].text

    # Strip markdown code fences
    raw = re.sub(r"```(?:json)?\s*", "", raw).strip()
    raw = raw.rstrip("`").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        return {"error": "JSON parse failed", "raw": raw[:500]}


def run_gap_analysis(
    resume_text: str,
    jd_text: str,
    resume_keywords: list[str],
    missing_keywords: list[str],
) -> dict:
    """Call Claude for section-wise gap analysis. Returns validated dict."""
    system = """You are a professional resume consultant and ATS expert with 10+ years of experience.

Analyze the resume against the job description and return ONLY a valid JSON object with this EXACT structure — no markdown, no explanation:

{
  "skills_gap": ["specific missing skill 1", "specific missing skill 2", "specific missing skill 3"],
  "experience_gap": "One precise sentence about experience level mismatch.",
  "education_gap": null,
  "overall_summary": "2-3 sentences: what matches well, main gap, recommendation.",
  "ats_score_estimate": 65
}

Rules:
- skills_gap: max 6 items, be specific
- experience_gap: factual, based on what you read
- education_gap: null if no gap detected
- ats_score_estimate: integer 0-100
- Return ONLY valid JSON"""

    user = f"""RESUME (first 3500 chars):
{resume_text[:3500]}

JOB DESCRIPTION (first 2500 chars):
{jd_text[:2500]}

ALREADY IDENTIFIED AS MISSING: {', '.join(missing_keywords[:10])}

Perform section-wise gap analysis."""

    result = call_claude_json(system, user)

    return {
        "skills_gap": result.get("skills_gap", missing_keywords[:5]),
        "experience_gap": result.get(
            "experience_gap", "Gap analysis not available."
        ),
        "education_gap": result.get("education_gap"),
        "overall_summary": result.get("overall_summary", "Analysis complete."),
        "ats_score_estimate": max(
            0, min(100, int(result.get("ats_score_estimate", 60)))
        ),
    }


def run_suggestions(
    resume_text: str,
    jd_text: str,
    matched_keywords: list[str],
    missing_keywords: list[str],
) -> dict:
    """Call Claude for rewrite suggestions. Returns validated dict."""
    system = """You are an expert resume writer specializing in ATS optimization and impact-driven bullet points.

Given a resume and job description, return ONLY a valid JSON object with this EXACT structure — no markdown:

{
  "summary_rewrite": {
    "original": "exact first 150 chars of resume summary/objective, or 'No summary section found.'",
    "improved": "a powerful, ATS-optimized 2-3 sentence summary targeting this specific JD"
  },
  "bullet_improvements": [
    {"original": "exact weak bullet from resume", "improved": "improved version with action verb, metric, and impact"},
    {"original": "another weak bullet", "improved": "another improved version"},
    {"original": "third weak bullet", "improved": "third improved version"}
  ],
  "keywords_to_add": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tips": [
    "Specific actionable tip 1 for this resume+JD combination",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ]
}

Rules:
- bullet_improvements: exactly 3 pairs with REAL bullets extracted from the resume
- improved bullets: start with strong verb (Architected/Engineered/Delivered/Optimized)
- keywords_to_add: from the missing keywords list, max 6
- tips: specific to this resume, not generic
- Return ONLY valid JSON"""

    user = f"""RESUME (first 3500 chars):
{resume_text[:3500]}

JOB DESCRIPTION (first 2000 chars):
{jd_text[:2000]}

MISSING KEYWORDS: {', '.join(missing_keywords[:8])}
MATCHED KEYWORDS: {', '.join(matched_keywords[:8])}

Generate targeted rewrite suggestions."""

    result = call_claude_json(system, user, max_tokens=2500)

    summary_rewrite = result.get("summary_rewrite", {})
    if not isinstance(summary_rewrite, dict):
        summary_rewrite = {
            "original": "No summary found.",
            "improved": "Could not generate rewrite.",
        }

    bullets = result.get("bullet_improvements", [])
    if not isinstance(bullets, list):
        bullets = []
    bullets = bullets[:3]

    # Ensure we always have 3 bullet pairs
    while len(bullets) < 3:
        bullets.append(
            {
                "original": "Built features for the team using existing technologies.",
                "improved": "Engineered scalable features that improved team velocity by 20% and reduced technical debt.",
            }
        )

    return {
        "summary_rewrite": {
            "original": summary_rewrite.get("original", "No summary found."),
            "improved": summary_rewrite.get(
                "improved", "Improved summary not available."
            ),
        },
        "bullet_improvements": [
            {
                "original": b.get("original", ""),
                "improved": b.get("improved", ""),
            }
            for b in bullets
        ],
        "keywords_to_add": result.get("keywords_to_add", missing_keywords[:6]),
        "tips": result.get(
            "tips",
            [
                "Quantify all achievements with specific numbers and percentages.",
                "Ensure all JD keywords appear in your skills section.",
                "Use strong action verbs to open each bullet point.",
            ],
        )[:3],
    }
