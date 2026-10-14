from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    subject: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)


class ContactMessageResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    subject: str
    message: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactMessageListResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    subject: str
    message_preview: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactMessageStatusUpdate(BaseModel):
    status: Literal["New", "Read"]