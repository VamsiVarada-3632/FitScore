"""App configuration from environment variables."""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Anthropic
    anthropic_api_key: str = "sk-placeholder"
    claude_model: str = "claude-sonnet-4-5"
    claude_max_tokens: int = 2000

    # App
    app_env: str = "development"
    app_port: int = 8000
    log_level: str = "INFO"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    # Models
    embedding_model: str = "all-MiniLM-L6-v2"

    # Cache
    cache_ttl_seconds: int = 3600
    embedding_cache_size: int = 500

    # Limits
    max_file_size_mb: int = 10
    max_jd_chars: int = 10000

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "case_sensitive": False}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
