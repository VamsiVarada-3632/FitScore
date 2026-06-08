"""
Gemini API client (replaces Claude).
Uses the new google-genai SDK (google.genai).
"""

import json
import re
from google import genai
from google.genai import types
from google.genai.errors import ServerError, ClientError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from core.config import get_settings

settings = get_settings()
_client: genai.Client | None = None

FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash-lite"]


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=3, max=15),
    retry=retry_if_exception_type(ServerError),
    reraise=True,
)
def _generate_with_fallback(prompt: str) -> str:
    """Try primary model, fall back through FALLBACK_MODELS on 503."""
    client = get_client()
    models_to_try = [settings.gemini_model] + [m for m in FALLBACK_MODELS if m != settings.gemini_model]
    last_error = None
    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            return response.text
        except ServerError as e:
            last_error = e
            continue
        except ClientError:
            raise
    raise last_error


def call_gemini_json(prompt: str) -> dict:
    """Call Gemini with model fallback and parse JSON from response."""
    raw: str = _generate_with_fallback(prompt)

    # Strip markdown fences just in case
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
    """Gap analysis via Gemini. Returns validated dict."""
    prompt = f"""You are a professional resume consultant and ATS expert with 10+ years of experience.

Analyze the resume against the job description and return ONLY valid JSON:

{{
  "skills_gap": ["specific missing skill 1", "specific missing skill 2", "specific missing skill 3"],
  "experience_gap": "One precise sentence about experience level mismatch.",
  "education_gap": null,
  "overall_summary": "2-3 sentences: what matches well, main gap, recommendation.",
  "ats_score_estimate": 65
}}

RESUME (first 3000 chars):
{resume_text[:3000]}

JOB DESCRIPTION (first 2000 chars):
{jd_text[:2000]}

MISSING KEYWORDS: {', '.join(missing_keywords[:10])}

Return ONLY valid JSON. No markdown. No explanation."""

    result = call_gemini_json(prompt)

    return {
        "skills_gap": result.get("skills_gap", missing_keywords[:5]),
        "experience_gap": result.get("experience_gap", "Gap analysis not available."),
        "education_gap": result.get("education_gap"),
        "overall_summary": result.get("overall_summary", "Analysis complete."),
        "ats_score_estimate": max(0, min(100, int(result.get("ats_score_estimate", 60)))),
    }


def run_suggestions(
    resume_text: str,
    jd_text: str,
    matched_keywords: list[str],
    missing_keywords: list[str],
) -> dict:
    """Rewrite suggestions via Gemini. Returns validated dict."""
    prompt = f"""You are an expert resume writer specializing in ATS optimization.

Return ONLY valid JSON:

{{
  "summary_rewrite": {{
    "original": "exact first 150 chars of resume summary, or 'No summary section found.'",
    "improved": "a powerful 2-3 sentence ATS-optimized summary targeting this specific JD"
  }},
  "bullet_improvements": [
    {{"original": "exact weak bullet from resume", "improved": "improved version with action verb and metric"}},
    {{"original": "another weak bullet", "improved": "another improved version"}},
    {{"original": "third weak bullet", "improved": "third improved version"}}
  ],
  "keywords_to_add": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tips": [
    "Specific actionable tip 1 for this resume+JD combination",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ]
}}

RESUME (first 3000 chars):
{resume_text[:3000]}

JOB DESCRIPTION (first 2000 chars):
{jd_text[:2000]}

MISSING KEYWORDS: {', '.join(missing_keywords[:8])}
MATCHED KEYWORDS: {', '.join(matched_keywords[:8])}

Return ONLY valid JSON. No markdown. No explanation."""

    result = call_gemini_json(prompt)

    summary = result.get("summary_rewrite", {})
    if not isinstance(summary, dict):
        summary = {"original": "No summary found.", "improved": "Not available."}

    bullets = result.get("bullet_improvements", [])
    if not isinstance(bullets, list):
        bullets = []

    while len(bullets) < 3:
        bullets.append({
            "original": "Built features for the team using existing technologies.",
            "improved": "Engineered scalable features improving team velocity by 20% and reducing technical debt.",
        })

    return {
        "summary_rewrite": {
            "original": summary.get("original", "No summary found."),
            "improved": summary.get("improved", "Not available."),
        },
        "bullet_improvements": [
            {"original": b.get("original", ""), "improved": b.get("improved", "")}
            for b in bullets[:3]
        ],
        "keywords_to_add": result.get("keywords_to_add", missing_keywords[:6]),
        "tips": result.get("tips", [
            "Quantify all achievements with specific numbers and percentages.",
            "Add missing keywords explicitly in your skills section.",
            "Use strong action verbs to open each bullet point.",
        ])[:3],
    }
