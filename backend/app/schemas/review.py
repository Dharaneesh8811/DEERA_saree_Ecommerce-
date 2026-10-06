from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ReviewStatus


class ReviewBase(BaseModel):
    customer_name: str
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class ReviewCreate(ReviewBase):
    product_id: UUID


class ReviewUpdate(BaseModel):
    customer_name: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = None
    status: ReviewStatus | None = None


class ReviewResponse(ReviewBase):
    id: UUID
    product_id: UUID
    status: ReviewStatus

    model_config = ConfigDict(from_attributes=True)