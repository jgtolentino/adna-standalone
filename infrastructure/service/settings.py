from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    """Application settings using pydantic for environment variable management"""

    # Supabase configuration - required
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str

    # PGVector configuration
    PGVECTOR_URL: Optional[str] = None

    # Model configuration
    MODEL_PATH: str = "models/ckpt.pt"

    # API configuration - API_TOKEN is required for production security
    API_TOKEN: str  # Required - no default, must be explicitly set
    RETURN_EMBEDDINGS: bool = False

    # CORS configuration - comma-separated list of allowed origins
    # Override in production with specific domains
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,https://*.vercel.app"

    # Environment identifier
    ENVIRONMENT: str = "development"

    # Service configuration
    LOG_LEVEL: str = "INFO"
    MAX_WORKERS: int = 4

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        origins = [origin.strip() for origin in self.CORS_ALLOWED_ORIGINS.split(",") if origin.strip()]
        # In production, never allow wildcard
        if self.ENVIRONMENT == "production":
            origins = [o for o in origins if o != "*"]
        return origins