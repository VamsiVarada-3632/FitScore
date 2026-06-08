"""
Full text preprocessing pipeline for FitScore.

Pipeline:
  PDF bytes → raw text (pdfplumber + PyMuPDF fallback)
           → clean text (strip artifacts, normalize whitespace)
           → section detection (Experience, Skills, Education, Summary)
           → ready for embedding + keyword extraction
"""

import re
import unicodedata
from io import BytesIO
from collections import Counter
from dataclasses import dataclass
from typing import Optional

import pdfplumber
import fitz  # PyMuPDF


@dataclass
class ParsedResume:
    full_text: str
    summary: Optional[str]
    skills_section: Optional[str]
    experience_section: Optional[str]
    education_section: Optional[str]
    word_count: int
    char_count: int


@dataclass
class ParsedJD:
    full_text: str
    requirements_section: Optional[str]
    responsibilities_section: Optional[str]
    word_count: int
    char_count: int
    inferred_role: str
    inferred_company: str


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Primary: pdfplumber. Fallback: PyMuPDF."""
    try:
        text = ""
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if len(text.strip()) > 100:
            return text.strip()
    except Exception:
        pass

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
        if text.strip():
            return text.strip()
    except Exception as e:
        raise ValueError(f"Could not extract text from PDF: {e}")

    raise ValueError("PDF appears to be empty or image-only. Please use a text-based PDF.")


def clean_text(text: str) -> str:
    """
    1. Normalize bullet symbols (before ASCII encoding strips them)
    2. Normalize unicode
    3. Remove control characters
    4. Remove standalone page numbers
    5. Remove repeated header/footer lines (3+ occurrences)
    6. Collapse multiple spaces
    7. Max 2 consecutive newlines
    """
    # Replace bullets BEFORE ASCII encoding (bullets are non-ASCII)
    text = re.sub(r"[•·▪▸◆●■►]", "-", text)
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    text = re.sub(r"^\s*\d+\s*$", "", text, flags=re.MULTILINE)

    lines = text.split("\n")
    line_counts = Counter(line.strip() for line in lines if len(line.strip()) > 3)
    repeated = {line for line, count in line_counts.items() if count >= 3}
    lines = [line for line in lines if line.strip() not in repeated]
    text = "\n".join(lines)

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = "\n".join(line.strip() for line in text.split("\n"))
    return text.strip()


SECTION_PATTERNS = {
    "summary": r"(?i)^(summary|professional\s+summary|profile|objective|about\s+me)\s*:?\s*$",
    "skills": r"(?i)^(skills|technical\s+skills|core\s+competencies|technologies|tech\s+stack|expertise)\s*:?\s*$",
    "experience": r"(?i)^(experience|work\s+experience|employment|professional\s+experience|career\s+history)\s*:?\s*$",
    "education": r"(?i)^(education|academic|qualifications|degrees?)\s*:?\s*$",
}


def detect_sections(text: str) -> dict[str, str]:
    lines = text.split("\n")
    sections: dict[str, str] = {}
    current_section: Optional[str] = None
    current_lines: list[str] = []

    for line in lines:
        stripped = line.strip()
        matched_section = None
        for section_name, pattern in SECTION_PATTERNS.items():
            if re.match(pattern, stripped):
                matched_section = section_name
                break

        if matched_section:
            if current_section and current_lines:
                sections[current_section] = "\n".join(current_lines).strip()
            current_section = matched_section
            current_lines = []
        else:
            if current_section:
                current_lines.append(line)

    if current_section and current_lines:
        sections[current_section] = "\n".join(current_lines).strip()

    return sections


def parse_resume(pdf_bytes: bytes) -> ParsedResume:
    raw_text = extract_text_from_pdf(pdf_bytes)
    cleaned = clean_text(raw_text)
    sections = detect_sections(cleaned)

    return ParsedResume(
        full_text=cleaned,
        summary=sections.get("summary"),
        skills_section=sections.get("skills"),
        experience_section=sections.get("experience"),
        education_section=sections.get("education"),
        word_count=len(cleaned.split()),
        char_count=len(cleaned),
    )


def clean_jd_text(jd_text: str) -> str:
    """Strip HTML, normalize unicode, remove boilerplate."""
    jd_text = re.sub(r"<[^>]+>", " ", jd_text)
    jd_text = unicodedata.normalize("NFKD", jd_text)
    jd_text = jd_text.encode("ascii", "ignore").decode("ascii")

    boilerplate = [
        r"(?i)equal\s+opportunity\s+employer.*",
        r"(?i)we\s+are\s+an\s+eeo.*",
        r"(?i)apply\s+now.*",
        r"(?i)click\s+here\s+to\s+apply.*",
    ]
    for pattern in boilerplate:
        jd_text = re.sub(pattern, "", jd_text, flags=re.IGNORECASE | re.DOTALL)

    jd_text = re.sub(r"[•·▪▸◆●■►]", "-", jd_text)
    jd_text = re.sub(r"[ \t]+", " ", jd_text)
    jd_text = re.sub(r"\n{3,}", "\n\n", jd_text)
    return jd_text.strip()


JD_SECTION_PATTERNS = {
    "requirements": r"(?i)^(requirements|qualifications|what\s+you.ll\s+(need|bring)|must\s+have|skills\s+required)\s*:?\s*$",
    "responsibilities": r"(?i)^(responsibilities|what\s+you.ll\s+do|duties|your\s+role|the\s+role)\s*:?\s*$",
}

ROLE_PATTERNS = [
    r"(?:senior|junior|lead|principal|staff)?\s*(?:software|frontend|backend|full[\s-]?stack|devops|ml|ai|data)\s*(?:engineer|developer|architect|scientist)",
    r"(?:product|project|program)\s*manager",
    r"(?:ux|ui|product)\s*designer",
]

COMPANY_PATTERNS = [
    r"(?:at|@|join|with)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?(?:\s+(?:Inc|Ltd|LLC|Corp|Co|Technologies|Labs|Systems)\.?)?)",
    r"([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+is\s+(?:hiring|looking|seeking)",
    r"About\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)",
]


def parse_jd(jd_text: str) -> ParsedJD:
    cleaned = clean_jd_text(jd_text)

    lines = cleaned.split("\n")
    sections: dict[str, str] = {}
    current_section: Optional[str] = None
    current_lines: list[str] = []

    for line in lines:
        stripped = line.strip()
        matched = None
        for section_name, pattern in JD_SECTION_PATTERNS.items():
            if re.match(pattern, stripped):
                matched = section_name
                break
        if matched:
            if current_section and current_lines:
                sections[current_section] = "\n".join(current_lines).strip()
            current_section = matched
            current_lines = []
        else:
            if current_section:
                current_lines.append(line)
    if current_section and current_lines:
        sections[current_section] = "\n".join(current_lines).strip()

    inferred_role = "Software Engineer"
    for pattern in ROLE_PATTERNS:
        match = re.search(pattern, cleaned, re.IGNORECASE)
        if match:
            inferred_role = match.group(0).strip().title()
            break

    inferred_company = "Tech Company"
    for pattern in COMPANY_PATTERNS:
        match = re.search(pattern, cleaned, re.IGNORECASE)
        if match:
            inferred_company = match.group(1).strip()
            break

    return ParsedJD(
        full_text=cleaned,
        requirements_section=sections.get("requirements"),
        responsibilities_section=sections.get("responsibilities"),
        word_count=len(cleaned.split()),
        char_count=len(cleaned),
        inferred_role=inferred_role,
        inferred_company=inferred_company,
    )
