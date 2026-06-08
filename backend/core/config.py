"""App configuration from environment variables."""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = "placeholder"
    gemini_model: str = "gemini-2.5-flash-lite"

    app_env: str = "development"
    app_port: int = 8001
    log_level: str = "INFO"

    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    embedding_model: str = "all-MiniLM-L6-v2"

    cache_ttl_seconds: int = 3600
    embedding_cache_size: int = 500

    max_file_size_mb: int = 10
    max_jd_chars: int = 10000

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "case_sensitive": False}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
