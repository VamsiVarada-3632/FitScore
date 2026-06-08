import pytest
from core.preprocessor import clean_text, clean_jd_text, parse_jd


def test_clean_text_removes_page_numbers():
    raw = "John Doe\n\n1\n\nExperience\nSoftware engineer for 5 years"
    cleaned = clean_text(raw)
    lines = cleaned.split("\n")
    assert not any(line.strip() == "1" for line in lines)


def test_clean_text_normalizes_bullets():
    raw = "• Python\n• React\n• TypeScript"
    cleaned = clean_text(raw)
    assert "•" not in cleaned
    assert "-" in cleaned


def test_clean_jd_strips_html():
    raw = "<p>We need a <strong>React developer</strong> with 3+ years.</p>"
    cleaned = clean_jd_text(raw)
    assert "<p>" not in cleaned
    assert "React developer" in cleaned


def test_clean_text_collapses_whitespace():
    raw = "Python   JavaScript    React"
    cleaned = clean_text(raw)
    assert "  " not in cleaned


def test_parse_jd_infers_role():
    jd = "We are looking for a Senior Frontend Engineer to join our team at Acme Corp."
    parsed = parse_jd(jd)
    assert any(
        kw in parsed.inferred_role.lower()
        for kw in ["frontend", "engineer", "developer", "software"]
    )


def test_parse_jd_infers_company():
    jd = "Join Acme Corp to work on amazing products as a React Developer."
    parsed = parse_jd(jd)
    assert "Acme" in parsed.inferred_company


def test_parse_jd_word_count():
    jd = "We need a developer with five years of experience in React and TypeScript."
    parsed = parse_jd(jd)
    assert parsed.word_count > 0
    assert parsed.char_count > 0
