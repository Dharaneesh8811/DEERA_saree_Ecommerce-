from pydantic import BaseModel, ConfigDict, field_validator

from app.services.storage import get_public_image_url


class StorageImageResponse(BaseModel):
    image_url: str | None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_url")
    @classmethod
    def normalize_image_url(cls, image_url: str | None) -> str | None:
        return get_public_image_url(image_url)
