import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_contact_notification(
    name: str,
    email: str,
    subject: str,
    message: str,
) -> None:
    if not all(
        [
            settings.SMTP_HOST,
            settings.SMTP_FROM_EMAIL,
            settings.CONTACT_NOTIFICATION_EMAIL,
        ]
    ):
        logger.info(
            "Contact email notification skipped: SMTP is not configured."
        )
        return

    mail = EmailMessage()
    mail["Subject"] = f"New Deera Silks enquiry: {subject}"
    mail["From"] = settings.SMTP_FROM_EMAIL
    mail["To"] = settings.CONTACT_NOTIFICATION_EMAIL
    mail["Reply-To"] = email
    mail.set_content(
        f"""A new message was submitted through the Deera Silks contact page.

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}
"""
    )

    try:
        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=10,
        ) as server:
            server.ehlo()

            if settings.SMTP_USE_TLS:
                server.starttls()
                server.ehlo()

            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(
                    settings.SMTP_USERNAME,
                    settings.SMTP_PASSWORD,
                )

            server.send_message(mail)

    except Exception:
        # Do not log message contents or credentials.
        logger.exception("Failed to send contact notification email.")


async def send_contact_notification(
    name: str,
    email: str,
    subject: str,
    message: str,
) -> None:
    await asyncio.to_thread(
        _send_contact_notification,
        name,
        email,
        subject,
        message,
    )