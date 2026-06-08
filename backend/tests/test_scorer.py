import pytest
from core.embeddings import compute_similarity, embed_text


def test_similarity_same_text_is_high():
    text = "Python React TypeScript Node.js AWS Docker Kubernetes"
    score = compute_similarity(text, text)
    assert score >= 95.0


def test_similarity_different_texts_is_lower():
    a = "Python machine learning data science tensorflow pytorch"
    b = "React frontend UI CSS HTML Tailwind JavaScript"
    score = compute_similarity(a, b)
    assert score < 90.0


def test_embed_text_returns_array():
    import numpy as np
    result = embed_text("Hello world")
    assert isinstance(result, np.ndarray)
    assert result.ndim == 1
    assert len(result) > 0


def test_embed_text_cached():
    text = "cache test string for fitscore"
    emb1 = embed_text(text)
    emb2 = embed_text(text)
    import numpy as np
    assert np.array_equal(emb1, emb2)
