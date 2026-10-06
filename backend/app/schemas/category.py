from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    name: str
    product_type: str
    saree: str
    description: str | None = None
    image_url: str | None = None
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = None
    product_type: str | None = None
    saree: str | None = None
    description: str | None = None
    image_url: str | None = None
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    product_type: str
    saree: str
    description: str | None = None
    image_url: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime