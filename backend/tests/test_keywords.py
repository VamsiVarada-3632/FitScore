import pytest
from core.keywords import (
    extract_keywords,
    find_missing_keywords,
    find_matched_keywords,
    score_label,
)


def test_extract_removes_stopwords():
    text = "the and or a developer with experience in React and TypeScript"
    kw = extract_keywords(text)
    assert "the" not in kw
    assert "and" not in kw
    assert any(k in ("react", "typescript") for k in kw)


def test_extract_captures_tech_terms():
    text = "We use Python, Docker, Kubernetes, PostgreSQL and GraphQL daily."
    kw = extract_keywords(text)
    assert "python" in kw
    assert "docker" in kw


def test_find_missing_detects_gap():
    resume = "Python JavaScript React CSS HTML"
    jd = "Python React GraphQL Docker Kubernetes TypeScript"
    missing = find_missing_keywords(resume, jd)
    assert any(m in ("graphql", "docker", "kubernetes") for m in missing)


def test_find_matched_detects_overlap():
    resume = "Python React TypeScript Node.js"
    jd = "React TypeScript GraphQL"
    matched = find_matched_keywords(resume, jd)
    assert any(m in ("react", "typescript") for m in matched)


def test_find_missing_excludes_matched():
    resume = "React Python Docker"
    jd = "React Python Docker GraphQL"
    missing = find_missing_keywords(resume, jd)
    assert "react" not in missing
    assert "python" not in missing


def test_score_label_strong():
    label, color = score_label(80)
    assert label == "Strong Match"
    assert color == "teal"


def test_score_label_good():
    label, color = score_label(65)
    assert label == "Good Match"


def test_score_label_partial():
    label, color = score_label(50)
    assert label == "Partial Match"
    assert color == "amber"


def test_score_label_weak():
    label, color = score_label(30)
    assert label == "Weak Match"
    assert color == "red"
