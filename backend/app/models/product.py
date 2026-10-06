from __future__ import annotations

from typing import TYPE_CHECKING
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.product_variant import ProductVariant
    from app.models.product_image import ProductImage
    from app.models.review import Review


class Product(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    category_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    mrp: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    discount_percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    color: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    occasion: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    fabric_weight: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    border_style: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    fabric: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    weave: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    zari: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    blouse_included: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    saree_length: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    gi_certified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    silk_mark_certified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    is_new_arrival: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_best_seller: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_editor_pick: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    category: Mapped["Category"] = relationship(
        "Category",
        back_populates="products",
    )

    variants: Mapped[list["ProductVariant"]] = relationship(
        "ProductVariant",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    images: Mapped[list["ProductImage"]] = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.display_order",
    )

    reviews: Mapped[list["Review"]] = relationship(
        "Review",
        back_populates="product",
        cascade="all, delete-orphan",
    )