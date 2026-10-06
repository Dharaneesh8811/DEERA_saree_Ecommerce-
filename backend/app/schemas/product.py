from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    name: str
    category_id: UUID
    price: Decimal

    description: str | None = None
    mrp: Decimal | None = None
    discount_percentage: Decimal | None = None
    color: str | None = None
    occasion: str | None = None
    fabric_weight: str | None = None
    border_style: str | None = None
    fabric: str | None = None
    weave: str | None = None
    zari: str | None = None
    blouse_included: bool = True
    saree_length: str | None = None
    gi_certified: bool = False
    silk_mark_certified: bool = False
    is_active: bool = True
    is_new_arrival: bool = False
    is_best_seller: bool = False
    is_editor_pick: bool = False


class ProductUpdate(BaseModel):
    name: str | None = None
    category_id: UUID | None = None
    price: Decimal | None = None

    description: str | None = None
    mrp: Decimal | None = None
    discount_percentage: Decimal | None = None
    color: str | None = None
    occasion: str | None = None
    fabric_weight: str | None = None
    border_style: str | None = None
    fabric: str | None = None
    weave: str | None = None
    zari: str | None = None
    blouse_included: bool | None = None
    saree_length: str | None = None
    gi_certified: bool | None = None
    silk_mark_certified: bool | None = None
    is_active: bool | None = None
    is_new_arrival: bool | None = None
    is_best_seller: bool | None = None
    is_editor_pick: bool | None = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None

    category_id: UUID

    price: Decimal
    mrp: Decimal | None = None
    discount_percentage: Decimal | None = None
    color: str | None = None
    occasion: str | None = None
    fabric_weight: str | None = None
    border_style: str | None = None
    fabric: str | None = None
    weave: str | None = None
    zari: str | None = None
    blouse_included: bool
    saree_length: str | None = None
    gi_certified: bool
    silk_mark_certified: bool

    is_active: bool
    is_new_arrival: bool
    is_best_seller: bool
    is_editor_pick: bool

    created_at: datetime
    updated_at: datetime