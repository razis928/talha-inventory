from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Talha Inventory API"
    debug: bool = True
    # Prefer PostgreSQL in production/local docker; override via DATABASE_URL.
    database_url: str = "postgresql+psycopg://talha:talha@localhost:5433/talha_inventory"
    api_v1_prefix: str = "/api/v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
