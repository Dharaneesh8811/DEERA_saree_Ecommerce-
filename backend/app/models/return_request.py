from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import ReturnStatus

if TYPE_CHECKING:
    from app.models.order import Order
    from app.models.order_item import OrderItem


class ReturnRequest(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "return_requests"

    order_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    order_item_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("order_items.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    customer_phone: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    request_type: Mapped[str] = mapped_column(String(20), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        default=ReturnStatus.REQUESTED.value,
        nullable=False,
    )
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    order: Mapped["Order"] = relationship()
    order_item: Mapped["OrderItem | None"] = relationship()