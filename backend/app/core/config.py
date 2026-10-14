from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str

    JWT_SECRET_KEY: str | None = None
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    S3_ENDPOINT_URL: str | None = None
    S3_ACCESS_KEY_ID: str | None = None
    S3_SECRET_ACCESS_KEY: str | None = None
    S3_BUCKET_NAME: str | None = None
    S3_REGION: str = "us-east-1"
    S3_PUBLIC_BASE_URL: str | None = None

    # Optional contact email notification settings
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    CONTACT_NOTIFICATION_EMAIL: str | None = None
    SMTP_USE_TLS: bool = True
    APPS_SCRIPT_EMAIL_NOTIFICATION_URL: str | None = None
    APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET: str | None = None

    model_config = SettingsConfigDict(
        env_file=BACKEND_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
