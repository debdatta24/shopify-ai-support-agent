from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # App
    app_env: str = "development"
    app_debug: bool = True
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # OpenAI
    openai_api_key: str = ""

    # AI Agent
    ai_model: str = "gpt-4o-mini"
    ai_max_tokens: int = 1024
    ai_temperature: float = 0.7

    # Shopify
    shopify_store_url: str = ""
    shopify_access_token: str = ""
    shopify_webhook_secret: str = ""

    # Memory
    max_conversation_history: int = 50

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key and not self.openai_api_key.startswith("sk-your"))

    @property
    def has_shopify(self) -> bool:
        return bool(
            self.shopify_store_url
            and self.shopify_access_token
            and not self.shopify_access_token.startswith("shpat_your")
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
