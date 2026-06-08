"""
Keyword extraction for resume + JD matching.

Strategy:
  1. Extract meaningful n-grams (unigrams + bigrams for tech terms)
  2. Lemmatize using NLTK WordNetLemmatizer
  3. Filter with expanded stopword list
  4. Tech-term boost: known tech keywords get priority
"""

import re
import nltk
from nltk.stem import WordNetLemmatizer


def _ensure_nltk_data() -> None:
    resources = [
        ("tokenizers/punkt_tab", "punkt_tab"),
        ("corpora/wordnet", "wordnet"),
        ("corpora/stopwords", "stopwords"),
        ("taggers/averaged_perceptron_tagger", "averaged_perceptron_tagger"),
    ]
    for path, name in resources:
        try:
            nltk.data.find(path)
        except LookupError:
            nltk.download(name, quiet=True)


_ensure_nltk_data()
LEMMATIZER = WordNetLemmatizer()

STOPWORDS = {
    "and", "or", "the", "a", "an", "in", "on", "at", "to", "for", "of", "with",
    "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does",
    "did", "will", "would", "could", "should", "may", "might", "must", "shall",
    "can", "need", "that", "this", "these", "those", "from", "by", "as", "up",
    "it", "its", "our", "your", "their", "we", "they", "you", "he", "she", "i",
    "not", "but", "if", "then", "when", "where", "what", "how", "who", "which",
    "about", "into", "through", "during", "before", "after", "above", "below",
    "between", "each", "all", "both", "few", "more", "most", "other", "some",
    "such", "no", "nor", "so", "yet", "just", "than", "too", "very", "s", "t",
    "now", "ll", "re", "ve", "m", "o", "use", "used", "using", "work", "working",
    "years", "year", "experience", "strong", "good", "excellent", "required",
    "preferred", "plus", "including", "etc", "eg", "ie", "new", "high", "large",
    "small", "ability", "skills", "skill", "knowledge", "understanding",
    "familiarity", "exposure", "help", "team", "teams", "company", "role",
    "position", "job", "opportunity", "also", "well", "across", "within",
    "ensure", "including", "following", "related", "relevant", "proven",
    "ability", "looking", "seeking", "join", "build", "building", "develop",
    "developing", "maintain", "maintaining", "collaborate", "collaborating",
}

TECH_BIGRAMS = {
    "machine learning", "deep learning", "natural language", "computer vision",
    "system design", "data structures", "object oriented", "test driven",
    "continuous integration", "continuous deployment", "version control",
    "code review", "agile methodology", "design patterns", "rest api",
    "graphql api", "real time", "large scale", "full stack", "open source",
    "cloud native", "micro services", "event driven", "domain driven",
    "ci cd", "type script", "react native",
}

PRIORITY_TECH_KEYWORDS = {
    # Languages
    "python", "javascript", "typescript", "java", "kotlin", "swift", "dart",
    "go", "rust", "cpp", "csharp", "ruby", "scala", "sql", "bash", "matlab",
    # Frontend
    "react", "vue", "angular", "nextjs", "svelte", "tailwind", "css", "html",
    "webpack", "vite", "redux", "zustand", "graphql", "apollo", "sass",
    # Backend
    "fastapi", "django", "flask", "express", "nestjs", "spring", "laravel",
    "nodejs", "rest", "grpc", "websocket", "microservices", "kafka", "rabbitmq",
    # Mobile
    "flutter", "android", "ios", "swiftui", "jetpack",
    # Data / AI / ML
    "tensorflow", "pytorch", "keras", "sklearn", "pandas", "numpy",
    "transformers", "langchain", "openai", "anthropic", "llm", "genai",
    "nlp", "bert", "gpt", "embeddings", "vector",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "linux", "nginx", "prometheus", "grafana", "datadog",
    # Databases
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "firebase",
    "dynamodb", "sqlite", "cassandra", "neo4j", "supabase",
    # Tools
    "git", "jira", "figma", "agile", "scrum", "tdd", "bdd",
    # Finance / Domain
    "fintech", "blockchain", "solidity", "web3", "defi",
}


def extract_keywords(text: str, max_keywords: int = 50) -> list[str]:
    """Extract deduplicated, lemmatized, priority-boosted keywords."""
    text_lower = text.lower()

    found_bigrams: set[str] = set()
    for bigram in TECH_BIGRAMS:
        if bigram in text_lower:
            found_bigrams.add(bigram)

    tokens = re.findall(r"\b[a-zA-Z][a-zA-Z+#.]{1,}\b", text_lower)
    lemmatized = [LEMMATIZER.lemmatize(t) for t in tokens]

    unigrams = {
        t for t in lemmatized
        if t not in STOPWORDS and len(t) >= 3
    }

    priority = {kw for kw in PRIORITY_TECH_KEYWORDS if kw in text_lower}

    all_kw = list(priority) + list(found_bigrams) + list(unigrams - priority)

    seen: set[str] = set()
    result: list[str] = []
    for kw in all_kw:
        if kw not in seen:
            seen.add(kw)
            result.append(kw)

    return result[:max_keywords]


def find_missing_keywords(resume_text: str, jd_text: str, max_missing: int = 20) -> list[str]:
    """Find JD keywords absent from resume, tech-priority sorted."""
    resume_kw = set(extract_keywords(resume_text, max_keywords=200))
    jd_kw = set(extract_keywords(jd_text, max_keywords=200))
    missing = jd_kw - resume_kw

    def sort_key(kw: str) -> tuple:
        return (kw not in PRIORITY_TECH_KEYWORDS, -len(kw))

    return sorted(missing, key=sort_key)[:max_missing]


def find_matched_keywords(resume_text: str, jd_text: str, max_matched: int = 15) -> list[str]:
    """Find keywords present in both resume and JD."""
    resume_kw = set(extract_keywords(resume_text, max_keywords=200))
    jd_kw = set(extract_keywords(jd_text, max_keywords=200))
    matched = jd_kw & resume_kw

    def sort_key(kw: str) -> tuple:
        return (kw not in PRIORITY_TECH_KEYWORDS, -len(kw))

    return sorted(matched, key=sort_key)[:max_matched]


def score_label(score: float) -> tuple[str, str]:
    """Return (label, color) for a given score."""
    if score >= 75:
        return "Strong Match", "teal"
    elif score >= 60:
        return "Good Match", "teal"
    elif score >= 40:
        return "Partial Match", "amber"
    else:
        return "Weak Match", "red"
