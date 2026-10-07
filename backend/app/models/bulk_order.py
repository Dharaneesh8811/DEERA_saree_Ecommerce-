from datetime import date

from sqlalchemy import Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class BulkOrder(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bulk_orders"

    customer_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    company_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    product_category: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    required_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    budget: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="New",
    )