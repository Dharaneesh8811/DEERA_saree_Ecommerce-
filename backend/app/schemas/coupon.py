from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CouponBase(BaseModel):
    code: str
    discount_type: Literal["percentage", "fixed"]
    discount_value: Decimal = Field(gt=0)
    minimum_order_amount: Decimal | None = Field(default=None, ge=0)
    maximum_discount_amount: Decimal | None = Field(default=None, ge=0)
    start_date: datetime | None = None
    end_date: datetime | None = None
    usage_limit: int | None = Field(default=None, ge=1)
    is_active: bool = True


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: str | None = None
    discount_type: Literal["percentage", "fixed"] | None = None
    discount_value: Decimal | None = Field(default=None, gt=0)
    minimum_order_amount: Decimal | None = Field(default=None, ge=0)
    maximum_discount_amount: Decimal | None = Field(default=None, ge=0)
    start_date: datetime | None = None
    end_date: datetime | None = None
    usage_limit: int | None = Field(default=None, ge=1)
    is_active: bool | None = None


class CouponResponse(CouponBase):
    id: UUID
    used_count: int

    model_config = ConfigDict(from_attributes=True)

class CouponApplyRequest(BaseModel):
    code: str
    order_amount: Decimal = Field(gt=0)


class CouponApplyResponse(BaseModel):
    code: str
    discount_type: str
    order_amount: Decimal
    discount_amount: Decimal
    final_amount: Decimal