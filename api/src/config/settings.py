from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized configuration management for API and security boundaries."""

    api_title: str = "Otakufy API"
    version: str = "0.1.0"
    cors_origins: list[str] = ["http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


    # File Upload Security Settings
    max_file_size: int = 2 * 1024 * 1024  # Strict 2MB Limit
    upload_dir: Path = Path(__file__).resolve().parents[3] / "secure_uploads"
    allowed_signatures: dict[bytes, str] = {
        b"\xFF\xD8\xFF": "jpg",
        b"\x89PNG\x0D\x0A\x1A\x0A": "png",
        b"RIFF": "webp",
    }

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
