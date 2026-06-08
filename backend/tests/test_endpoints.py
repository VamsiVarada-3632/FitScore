import pytest
import io
from httpx import AsyncClient, ASGITransport
from main import app

LONG_JD = (
    "We are looking for a Senior React Developer to join our growing team at TechCorp. "
    "You will build scalable frontend applications using React, TypeScript, and GraphQL. "
    "Requirements: 5+ years React experience, TypeScript, Node.js, Docker, AWS, GraphQL. "
    "Nice to have: Kubernetes, Redis, PostgreSQL, system design experience."
)


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health/")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "version" in data
    assert "embedding_model_loaded" in data


@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "main_endpoint" in body


@pytest.mark.asyncio
async def test_score_rejects_non_pdf():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/score/",
            files={"resume": ("resume.docx", b"fake content", "application/octet-stream")},
            data={"jd_text": LONG_JD},
        )
    assert resp.status_code == 400
    assert resp.headers.get("x-error-code") == "INVALID_FILE_TYPE"


@pytest.mark.asyncio
async def test_score_rejects_short_jd():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/score/",
            files={"resume": ("resume.pdf", b"%PDF-1.4 fake pdf content", "application/pdf")},
            data={"jd_text": "too short"},
        )
    assert resp.status_code == 400
    assert resp.headers.get("x-error-code") == "JD_TOO_SHORT"


@pytest.mark.asyncio
async def test_analyze_rejects_non_pdf():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/analyze/",
            files={"resume": ("resume.txt", b"plain text", "text/plain")},
            data={"jd_text": LONG_JD},
        )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_suggest_rejects_non_pdf():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/suggest/",
            files={"resume": ("resume.txt", b"plain text", "text/plain")},
            data={"jd_text": LONG_JD},
        )
    assert resp.status_code == 400
