import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.email import send_contact_notification
from app.db.dependencies import get_db
from app.models.contact_message import ContactMessage
from app.schemas.contact_message import (
    ContactMessageCreate,
    ContactMessageResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/contact",
    tags=["Contact"],
)


@router.post(
    "",
    response_model=ContactMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_contact_message(
    data: ContactMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    contact_message = ContactMessage(
        name=data.name.strip(),
        email=str(data.email),
        subject=data.subject.strip(),
        message=data.message.strip(),
        status="New",
    )

    if (
        len(contact_message.name) < 2
        or len(contact_message.subject) < 2
        or len(contact_message.message) < 10
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a valid name, subject, and message.",
        )

    try:
        db.add(contact_message)
        await db.commit()
        await db.refresh(contact_message)
    except Exception:
        await db.rollback()
        logger.exception("Failed to save contact message.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="We couldn't submit your message. Please try again.",
        )

    # Notify the admin only after the message is safely saved.
    await send_contact_notification(
        name=contact_message.name,
        email=contact_message.email,
        subject=contact_message.subject,
        message=contact_message.message,
    )

    return contact_message