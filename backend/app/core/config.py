"""Application settings, loaded from the environment.

No secrets are hardcoded. Localhost defaults exist only for convenience when
running outside Docker; every value is overridable via environment variables.
"""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Application ---
    project_name: str = "Inventory & Order Management API"
    version: str = "1.0.0"
    environment: str = "development"
    log_level: str = "INFO"

    # --- Database ---
    database_url: str = (
        "postgresql+psycopg2://postgres:postgres@localhost:5432/inventory"
    )

    # --- CORS ---
    # Comma-separated list of allowed browser origins.
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # --- Business rules ---
    low_stock_threshold: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("database_url")
    @classmethod
    def _normalize_database_url(cls, value: str) -> str:
        """Ensure the URL uses the psycopg2 driver.

        Managed hosts (e.g. Render, Heroku) provide URLs like
        ``postgres://...`` or ``postgresql://...`` with no driver. SQLAlchemy
        needs an explicit ``postgresql+psycopg2://`` dialect, so we rewrite it.
        """
        if value.startswith("postgres://"):
            value = "postgresql://" + value[len("postgres://"):]
        if value.startswith("postgresql://"):
            value = "postgresql+psycopg2://" + value[len("postgresql://"):]
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached accessor so settings are parsed once per process."""
    return Settings()


settings = get_settings()
