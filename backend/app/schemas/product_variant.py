from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProductVariantCreate(BaseModel):
    product_id: UUID
    name: str
    sku: str
    price: Decimal | None = None
    stock_quantity: int = 0
    is_active: bool = True


class ProductVariantUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    price: Decimal | None = None
    stock_quantity: int | None = None
    is_active: bool | None = None


class ProductVariantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    name: str
    sku: str
    price: Decimal | None
    stock_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime