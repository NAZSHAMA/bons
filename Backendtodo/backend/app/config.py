from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """Application settings and configuration"""

    # Application
    app_name: str = "Bonsai API"
    app_version: str = "1.0.0"
    debug: bool = False
    api_prefix: str = "/api/v1"

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # Database (SQLite with async support)
    database_url: str = "sqlite+aiosqlite:///./bonsai.db"

    # API Keys and Secrets (for future use)
    secret_key: str = "your-secret-key-here-change-in-production"
    api_key: str = ""

    # Cron Jobs
    enable_cron_jobs: bool = True

    # Email Configuration
    mail_enabled: bool = False
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = "noreply@bonsai.app"
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_starttls: bool = True
    mail_ssl_tls: bool = False
    mail_use_credentials: bool = True
    mail_validate_certs: bool = True

    # Frontend URL (for email links)
    frontend_url: str = "http://localhost:3000"

    # Email Verification
    email_verification_required: bool = False
    verification_token_expire_hours: int = 24

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

# Create settings instance
settings = Settings()
