from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin, TimestampMixin


class Hero(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "hero"

    heading: Mapped[str] = mapped_column(
        String(160),
        nullable=False,
        default="Women with heritage.",
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="Discover timeless silk sarees rooted in craftsmanship, reimagined for the way you celebrate today.",
    )

    cta_text: Mapped[str] = mapped_column(
        String(60),
        nullable=False,
        default="Explore Collection",
    )

    cta_url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
        default="/collections",
    )

    image_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )