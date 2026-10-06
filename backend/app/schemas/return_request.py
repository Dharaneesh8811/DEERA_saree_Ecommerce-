from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ReturnRequestType, ReturnStatus


class ReturnRequestCreate(BaseModel):
    order_id: UUID
    order_item_id: UUID | None = None
    customer_phone: str = Field(min_length=5, max_length=30)
    request_type: ReturnRequestType
    reason: str = Field(min_length=1, max_length=2000)


class ReturnRequestStatusUpdate(BaseModel):
    status: ReturnStatus
    admin_notes: str | None = None


class ReturnRequestResponse(BaseModel):
    id: UUID
    order_id: UUID
    order_item_id: UUID | None
    customer_phone: str
    request_type: ReturnRequestType
    reason: str
    status: ReturnStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminReturnRequestResponse(ReturnRequestResponse):
    admin_notes: str | None