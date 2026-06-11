---
title: FitScore AI API
emoji: 🎯
colorFrom: green
colorTo: teal
sdk: docker
pinned: false
---

# FitScore AI — Resume Match API

FastAPI backend for FitScore AI. Analyzes resume vs job description match using sentence-transformers and Google Gemini AI.

## Endpoints
- `POST /analyze/full` — Full analysis (score + gap + suggestions)
- `POST /score/` — Match score only
- `GET /health/` — Health check
- `GET /docs` — Swagger UI
