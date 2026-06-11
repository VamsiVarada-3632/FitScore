import hashlib
import numpy as np
from cachetools import LRUCache
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

EMBEDDING_CACHE = LRUCache(maxsize=200)
_model_instance = None


def get_model(model_name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
    global _model_instance
    if _model_instance is None:
        _model_instance = SentenceTransformer(model_name)
    return _model_instance


def warmup_model():
    model = get_model()
    _ = model.encode(["warmup"])
    return True


def _cache_key(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def embed_text(text: str, chunk_size: int = 3000) -> np.ndarray:
    key = _cache_key(text)
    if key in EMBEDDING_CACHE:
        return EMBEDDING_CACHE[key]

    model = get_model()

    if len(text) > chunk_size:
        chunks = []
        for i in range(0, len(text), chunk_size - 200):
            chunk = text[i:i + chunk_size]
            if len(chunk) > 50:
                chunks.append(chunk)
        embeddings = model.encode(chunks)
        result = np.mean(embeddings, axis=0)
    else:
        result = model.encode([text])[0]

    EMBEDDING_CACHE[key] = result
    return result


def compute_similarity(text_a: str, text_b: str) -> float:
    emb_a = embed_text(text_a)
    emb_b = embed_text(text_b)
    sim = cosine_similarity([emb_a], [emb_b])[0][0]
    return round(float(sim) * 100, 2)
