from __future__ import annotations

from enum import Enum

from sqlalchemy import Boolean, String
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class AdminRole(str, Enum):
    ADMIN = "admin"
    STORE = "store"


class Admin(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "admins"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    role: Mapped[AdminRole] = mapped_column(
        ENUM(AdminRole, name="admin_role", create_type=True),
        default=AdminRole.ADMIN,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
