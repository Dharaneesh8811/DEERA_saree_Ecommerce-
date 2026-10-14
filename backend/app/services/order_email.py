import logging

import httpx

from app.core.config import settings
from app.models.enums import OrderStatus
from app.models.order import Order

logger = logging.getLogger(__name__)


def _notification_payload(
    order: Order,
    event: str,
    event_id: str,
) -> dict[str, object]:
    return {
        "event": event,
        "event_id": event_id,
        "secret": settings.APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET,
        "order_id": str(order.id),
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "items": [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": str(item.unit_price),
                "subtotal": str(item.subtotal),
            }
            for item in order.items
        ],
        "subtotal": str(order.subtotal),
        "shipping_fee": str(order.shipping_fee),
        "discount_amount": str(order.discount_amount),
        "total_amount": str(order.final_amount),
        "status": order.status.value,
    }


async def _send_notification(payload: dict[str, object]) -> None:
    url = settings.APPS_SCRIPT_EMAIL_NOTIFICATION_URL
    secret = settings.APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET
    event_id = str(payload["event_id"])
    order_id = str(payload["order_id"])

    if not url or not secret:
        logger.warning(
            "Order email notification skipped: Apps Script configuration is incomplete "
            "(event_id=%s, order_id=%s).",
            event_id,
            order_id,
        )
        return

    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            response = await client.post(url, json=payload)
    except (httpx.HTTPError, httpx.InvalidURL) as error:
        logger.warning(
            "Order email notification request failed "
            "(event_id=%s, order_id=%s, error_type=%s).",
            event_id,
            order_id,
            type(error).__name__,
        )
        return

    if not response.is_success:
        logger.warning(
            "Apps Script order email request returned HTTP %s "
            "(event_id=%s, order_id=%s).",
            response.status_code,
            event_id,
            order_id,
        )
        return

    try:
        result = response.json()
    except ValueError:
        logger.warning(
            "Apps Script order email response was not valid JSON "
            "(event_id=%s, order_id=%s, http_status=%s, content_type=%s, host=%s).",
            event_id,
            order_id,
            response.status_code,
            response.headers.get("content-type", "").split(";", 1)[0],
            response.url.host,
        )
        return

    if not isinstance(result, dict) or result.get("success") is not True:
        logger.warning(
            "Apps Script did not confirm the order email notification "
            "(event_id=%s, order_id=%s, http_status=%s, response_type=%s).",
            event_id,
            order_id,
            response.status_code,
            type(result).__name__,
        )
        return

    logger.info(
        "Apps Script accepted the order email notification "
        "(event_id=%s, order_id=%s, http_status=%s).",
        event_id,
        order_id,
        response.status_code,
    )


async def notify_order_placed(order: Order) -> None:
    if not order.customer_email:
        logger.info(
            "Order email notification skipped: customer email is not available "
            "(order_id=%s).",
            order.id,
        )
        return

    await _send_notification(
        _notification_payload(
            order,
            event="order_placed",
            event_id=f"{order.id}:order_placed",
        )
    )


async def notify_order_status_updated(
    order: Order,
    previous_status: OrderStatus,
) -> None:
    if not order.customer_email:
        logger.info(
            "Order status email skipped: customer email is not available "
            "(order_id=%s).",
            order.id,
        )
        return

    await _send_notification(
        {
            **_notification_payload(
                order,
                event="order_status_updated",
                event_id=(
                    f"{order.id}:status:{previous_status.value}:"
                    f"{order.status.value}"
                ),
            ),
            "previous_status": previous_status.value,
            "new_status": order.status.value,
        }
    )
