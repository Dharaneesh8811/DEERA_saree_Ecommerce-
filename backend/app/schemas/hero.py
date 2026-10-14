from __future__ import annotations

from datetime import datetime
from urllib.parse import urlsplit
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.storage_image_response import StorageImageResponse


class HeroContentUpdate(BaseModel):
    heading: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=2000)

    @field_validator("heading", "description")
    @classmethod
    def trim_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value


class HeroSlideFields(BaseModel):
    heading: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1, max_length=2000)
    cta_text: str = Field(min_length=1, max_length=60)
    cta_url: str = Field(min_length=1, max_length=2048)

    @field_validator("heading", "description", "cta_text")
    @classmethod
    def trim_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value

    @field_validator("cta_url")
    @classmethod
    def validate_cta_url(cls, value: str) -> str:
        value = value.strip()
        if not value or "\\" in value or any(ord(char) < 32 for char in value):
            raise ValueError("CTA URL must be a valid web URL or site path")

        parsed = urlsplit(value)
        if value.startswith("/") and not value.startswith("//"):
            return value
        if parsed.scheme in {"http", "https"} and parsed.netloc:
            return value
        raise ValueError("CTA URL must be a valid web URL or site path")


class HeroSlideStatusUpdate(BaseModel):
    is_active: bool


class HeroSlideReorder(BaseModel):
    slide_ids: list[UUID] = Field(min_length=1)


class HeroResponse(StorageImageResponse):
    id: UUID
    image_url: str
    heading: str
    description: str
    cta_text: str
    cta_url: str
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)