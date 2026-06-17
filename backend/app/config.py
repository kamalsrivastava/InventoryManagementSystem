"""Application configuration loaded from environment variables.

No credentials are hardcoded — every value can be overridden via the
environment (see .env.example). Sensible localhost defaults are provided
only to make local non-Docker runs convenient.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Full SQLAlchemy database URL. In Docker this points at the `db` service.
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/inventory"

    # Comma-separated list of origins allowed to call the API (CORS).
    # The frontend dev server and the deployed frontend go here.
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Threshold at/below which a product is reported as "low stock".
    low_stock_threshold: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
