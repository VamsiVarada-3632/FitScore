"""
Lightweight scoring using TF-IDF style keyword overlap.
Replaces sentence-transformers to fit Render free tier 512MB limit.
"""
import re
import math
from collections import Counter


def get_model():
    return None


def warmup_model():
    return True


def compute_similarity(text_a: str, text_b: str) -> float:
    """TF-IDF cosine similarity without heavy ML models."""
    def tokenize(text):
        return re.findall(r'\b[a-zA-Z][a-zA-Z+#.]{2,}\b', text.lower())

    def tfidf_vector(tokens):
        tf = Counter(tokens)
        return {token: tf[token] / len(tokens) for token in set(tokens)} if tokens else {}

    tokens_a = tokenize(text_a)
    tokens_b = tokenize(text_b)

    if not tokens_a or not tokens_b:
        return 0.0

    vec_a = tfidf_vector(tokens_a)
    vec_b = tfidf_vector(tokens_b)

    all_keys = set(vec_a.keys()) | set(vec_b.keys())
    dot = sum(vec_a.get(k, 0) * vec_b.get(k, 0) for k in all_keys)
    mag_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
    mag_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))

    if mag_a == 0 or mag_b == 0:
        return 0.0

    return round(min((dot / (mag_a * mag_b)) * 100 * 2.5, 100), 2)


def embed_text(text: str) -> list:
    return []
