from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Enum, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin
from app.models.enums import OrderStatus

if TYPE_CHECKING:
    from app.models.order_item import OrderItem


class Order(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "orders"

    customer_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    customer_phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )

    customer_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    shipping_address_line1: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    shipping_address_line2: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    shipping_city: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    shipping_state: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    shipping_postal_code: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    shipping_country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    shipping_fee: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    final_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    coupon_code: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    status: Mapped[OrderStatus] = mapped_column(
        Enum(
            OrderStatus,
            name="order_status",
            native_enum=True,
            create_type=False,
        ),
        default=OrderStatus.PLACED,
        nullable=False,
        index=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )