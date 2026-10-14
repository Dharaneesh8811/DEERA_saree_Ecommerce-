from uuid import UUID

from pydantic import BaseModel

from app.schemas.storage_image_response import StorageImageResponse


class ProductImageBase(BaseModel):
    image_url: str
    alt_text: str | None = None
    display_order: int = 0
    is_primary: bool = False


class ProductImageCreate(ProductImageBase):
    product_id: UUID


class ProductImageUpdate(BaseModel):
    image_url: str | None = None
    alt_text: str | None = None
    display_order: int | None = None
    is_primary: bool | None = None


class ProductImageResponse(ProductImageBase, StorageImageResponse):
    id: UUID
    product_id: UUID