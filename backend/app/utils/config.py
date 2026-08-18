"""
NIRNAY – Application Settings

Reads .env and exposes typed configuration via pydantic-settings.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Resolve the project root (backend/) so .env is found regardless of cwd
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Centralised, validated application configuration."""

    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_DIR / ".env") if (_BACKEND_DIR / ".env").exists() else None,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────
    app_name: str = "NIRNAY"
    app_version: str = "0.1.0"
    app_env: str = "development"
    debug: bool = True

    # ── Server ───────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000

    # ── Database ─────────────────────────────────────────
    database_url: str = "sqlite:///./nirnay.db"

    # ── JWT ──────────────────────────────────────────────
    jwt_secret_key: str = "nirnay-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    # ── CORS ─────────────────────────────────────────────
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # ── Uploads ──────────────────────────────────────────
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 10

    # ── Derived helpers ──────────────────────────────────
    @property
    def cors_origin_list(self) -> list[str]:
        """Return CORS origins as a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached singleton so we read .env once per process."""
    return Settings()
