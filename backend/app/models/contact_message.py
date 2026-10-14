from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class ContactMessage(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "contact_messages"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="New",
        server_default="New",
    )

    @property
    def message_preview(self) -> str:
        if len(self.message) <= 180:
            return self.message
        return f"{self.message[:177]}..."
