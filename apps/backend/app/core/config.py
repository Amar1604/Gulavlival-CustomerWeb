from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Gulavlival Grand API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/gulavlival_grand"
    
    # Security & JWT
    SECRET_KEY: str = "change_this_jwt_secret_key_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Environment
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
