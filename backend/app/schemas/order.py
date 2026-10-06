from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, EmailStr

from app.models.enums import OrderStatus


# -------------------------
# Order Item Schemas
# -------------------------

class OrderItemCreate(BaseModel):
    product_id: UUID
    product_variant_id: UUID | None = None
    quantity: int = Field(..., ge=1)


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product_variant_id: UUID | None
    product_name: str
    product_sku: str | None
    unit_price: Decimal
    quantity: int
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Order Create
# -------------------------

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=150)
    customer_phone: str = Field(..., min_length=5, max_length=30)
    customer_email: EmailStr | None = Field(default=None, max_length=255)

    shipping_address_line1: str | None = Field(default=None, max_length=255)
    shipping_address_line2: str | None = Field(default=None, max_length=255)
    shipping_city: str | None = Field(default=None, max_length=100)
    shipping_state: str | None = Field(default=None, max_length=100)
    shipping_postal_code: str | None = Field(default=None, max_length=30)
    shipping_country: str | None = Field(default=None, max_length=100)

    items: list[OrderItemCreate] = Field(..., min_length=1)

    coupon_code: str | None = Field(default=None, max_length=50)
    notes: str | None = None


# -------------------------
# Order Update
# -------------------------

class OrderUpdateStatus(BaseModel):
    status: OrderStatus


class OrderItemUpdate(BaseModel):
    product_id: UUID
    product_variant_id: UUID | None = None
    quantity: int = Field(..., ge=1)


class OrderItemsUpdate(BaseModel):
    items: list[OrderItemUpdate] = Field(..., min_length=1)


# -------------------------
# Order Response
# -------------------------

class OrderResponse(BaseModel):
    id: UUID

    customer_name: str
    customer_phone: str
    customer_email: str | None

    shipping_address_line1: str | None
    shipping_address_line2: str | None
    shipping_city: str | None
    shipping_state: str | None
    shipping_postal_code: str | None
    shipping_country: str | None

    subtotal: Decimal
    shipping_fee: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    final_amount: Decimal

    coupon_code: str | None
    status: OrderStatus
    notes: str | None

    items: list[OrderItemResponse]

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)