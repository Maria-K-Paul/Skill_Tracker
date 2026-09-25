"""
app/core/config.py
------------------
Application configuration loaded from environment variables via pydantic-settings.

All secrets and environment-specific values must be set in the .env file.
Never hard-code credentials here.

TODO: Add field validators for DATABASE_URL format.
TODO: Add environment-specific config profiles (dev / staging / prod).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/skill_leveling_db"

    # ── Security ──────────────────────────────────────────────────────────────
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # ── Encryption (secret codes) ─────────────────────────────────────────────
    code_encryption_key: str = "change-me-to-a-fernet-key"

    # ── LLM ───────────────────────────────────────────────────────────────────
    llm_provider: str = "openai"
    llm_api_key: str = ""
    llm_model: str = "gpt-4o"

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    allowed_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
