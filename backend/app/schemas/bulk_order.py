from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# -------------------------
# Bulk Order Create
# -------------------------

class BulkOrderCreate(BaseModel):
    customer_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    company_name: str | None = Field(
        default=None,
        max_length=200,
    )

    email: EmailStr

    phone: str = Field(
        ...,
        min_length=5,
        max_length=30,
    )

    product_category: str | None = Field(
        default=None,
        max_length=150,
    )

    quantity: int = Field(
        ...,
        ge=1,
    )

    required_date: date | None = None

    budget: str | None = Field(
        default=None,
        max_length=100,
    )

    message: str | None = Field(
        default=None,
        max_length=2000,
    )


# -------------------------
# Bulk Order Update
# -------------------------

class BulkOrderUpdate(BaseModel):
    status: str | None = Field(
        default=None,
        max_length=30,
    )


# -------------------------
# Bulk Order Response
# -------------------------

class BulkOrderResponse(BaseModel):
    id: UUID

    customer_name: str
    company_name: str | None

    email: EmailStr
    phone: str

    product_category: str | None
    quantity: int

    required_date: date | None

    budget: str | None
    message: str | None

    status: str

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)