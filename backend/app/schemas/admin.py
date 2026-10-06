from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.admin import AdminRole


class AdminLogin(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=256)


class AdminResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: AdminRole
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse