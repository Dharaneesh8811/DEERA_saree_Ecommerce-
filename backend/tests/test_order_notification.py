import json
import unittest
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import httpx

from app.api.routes import orders as order_routes
from app.core.config import settings
from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate, OrderUpdateStatus
from app.services.order_email import (
    notify_order_placed,
    notify_order_status_updated,
)


def make_order(*, email: str | None = "customer@example.com") -> Order:
    return Order(
        id=uuid4(),
        order_number="DEERA ORDER-1",
        customer_name="Test Customer",
        customer_email=email,
        customer_phone="5551234567",
        subtotal=Decimal("120.00"),
        shipping_fee=Decimal("0.00"),
        discount_amount=Decimal("20.00"),
        total_amount=Decimal("120.00"),
        final_amount=Decimal("100.00"),
        status=OrderStatus.PLACED,
        created_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        items=[
            OrderItem(
                product_name="Silk Saree",
                quantity=2,
                unit_price=Decimal("60.00"),
                subtotal=Decimal("120.00"),
            )
        ],
    )


class OrderNotificationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.original_url = settings.APPS_SCRIPT_EMAIL_NOTIFICATION_URL
        self.original_secret = settings.APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET
        settings.APPS_SCRIPT_EMAIL_NOTIFICATION_URL = "https://example.test/exec"
        settings.APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET = "test-shared-secret"

    def tearDown(self):
        settings.APPS_SCRIPT_EMAIL_NOTIFICATION_URL = self.original_url
        settings.APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET = self.original_secret

    async def test_order_placed_posts_server_calculated_order_details(self):
        captured = {}

        def handler(request: httpx.Request) -> httpx.Response:
            captured["request"] = request
            return httpx.Response(200, json={"success": True})

        real_async_client = httpx.AsyncClient
        with patch(
            "app.services.order_email.httpx.AsyncClient",
            side_effect=lambda **kwargs: real_async_client(
                transport=httpx.MockTransport(handler),
                **kwargs,
            ),
        ):
            await notify_order_placed(make_order())

        request = captured["request"]
        payload = json.loads(request.content)
        self.assertEqual(request.method, "POST")
        self.assertEqual(payload["secret"], "test-shared-secret")
        self.assertEqual(payload["event"], "order_placed")
        self.assertEqual(payload["order_number"], "DEERA ORDER-1")
        self.assertEqual(payload["items"][0]["quantity"], 2)
        self.assertEqual(payload["items"][0]["unit_price"], "60.00")
        self.assertEqual(payload["total_amount"], "100.00")
        self.assertEqual(payload["status"], "placed")

    async def test_status_update_includes_previous_and_new_status(self):
        captured = {}

        def handler(request: httpx.Request) -> httpx.Response:
            captured["payload"] = json.loads(request.content)
            return httpx.Response(200, json={"success": True})

        order = make_order()
        order.status = OrderStatus.UNDER_REVIEW
        real_async_client = httpx.AsyncClient
        with patch(
            "app.services.order_email.httpx.AsyncClient",
            side_effect=lambda **kwargs: real_async_client(
                transport=httpx.MockTransport(handler),
                **kwargs,
            ),
        ):
            await notify_order_status_updated(order, OrderStatus.PLACED)

        payload = captured["payload"]
        self.assertEqual(payload["event"], "order_status_updated")
        self.assertEqual(payload["previous_status"], "placed")
        self.assertEqual(payload["new_status"], "under_review")
        self.assertEqual(payload["status"], "under_review")
        self.assertIn(str(order.id), payload["event_id"])

    async def test_missing_customer_email_skips_request(self):
        order = make_order(email=None)
        with patch(
            "app.services.order_email.httpx.AsyncClient"
        ) as client, self.assertLogs(
            "app.services.order_email", level="INFO"
        ) as logs:
            await notify_order_placed(order)

        client.assert_not_called()
        self.assertIn(str(order.id), "\n".join(logs.output))

    async def test_apps_script_failure_does_not_escape_notification_service(self):
        def handler(_: httpx.Request) -> httpx.Response:
            return httpx.Response(503, json={"success": False})

        real_async_client = httpx.AsyncClient
        with patch(
            "app.services.order_email.httpx.AsyncClient",
            side_effect=lambda **kwargs: real_async_client(
                transport=httpx.MockTransport(handler),
                **kwargs,
            ),
        ):
            await notify_order_placed(make_order())

    async def test_apps_script_json_failure_is_not_treated_as_success(self):
        def handler(_: httpx.Request) -> httpx.Response:
            return httpx.Response(200, json={"success": False})

        real_async_client = httpx.AsyncClient
        with (
            patch(
                "app.services.order_email.httpx.AsyncClient",
                side_effect=lambda **kwargs: real_async_client(
                    transport=httpx.MockTransport(handler),
                    **kwargs,
                ),
            ),
            self.assertLogs("app.services.order_email", level="WARNING"),
        ):
            await notify_order_placed(make_order())

    async def test_non_json_response_is_logged_without_sensitive_values(self):
        order = make_order()

        def handler(_: httpx.Request) -> httpx.Response:
            return httpx.Response(
                200,
                text="Not authorized",
                headers={"content-type": "text/html; charset=utf-8"},
            )

        real_async_client = httpx.AsyncClient
        with (
            patch(
                "app.services.order_email.httpx.AsyncClient",
                side_effect=lambda **kwargs: real_async_client(
                    transport=httpx.MockTransport(handler),
                    **kwargs,
                ),
            ),
            self.assertLogs("app.services.order_email", level="WARNING") as logs,
        ):
            await notify_order_placed(order)

        output = "\n".join(logs.output)
        self.assertIn(str(order.id), output)
        self.assertIn("content_type=text/html", output)
        self.assertNotIn("customer@example.com", output)
        self.assertNotIn("test-shared-secret", output)
        self.assertNotIn("Not authorized", output)

    async def test_http_failure_logs_status_without_response_body(self):
        def handler(_: httpx.Request) -> httpx.Response:
            return httpx.Response(503, text="private response details")

        real_async_client = httpx.AsyncClient
        with (
            patch(
                "app.services.order_email.httpx.AsyncClient",
                side_effect=lambda **kwargs: real_async_client(
                    transport=httpx.MockTransport(handler),
                    **kwargs,
                ),
            ),
            self.assertLogs("app.services.order_email", level="WARNING") as logs,
        ):
            await notify_order_placed(make_order())

        output = "\n".join(logs.output)
        self.assertIn("HTTP 503", output)
        self.assertNotIn("private response details", output)

    async def test_order_creation_notifies_only_after_commit(self):
        order = make_order()
        events = []
        db = AsyncMock()
        db.add = lambda _: None
        db.commit.side_effect = lambda: events.append("commit")

        async def get_order_after_commit(*_args):
            events.append("reload")
            return order

        async def build_items(*_args):
            return order.items, order.subtotal

        async def no_coupon(*_args):
            return None

        async def notification(*_args):
            events.append("notify")

        payload = OrderCreate(
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            customer_email=order.customer_email,
            items=[{"product_id": uuid4(), "quantity": 2}],
        )
        with (
            patch.object(order_routes, "_build_items", side_effect=build_items),
            patch.object(order_routes, "_get_coupon", side_effect=no_coupon),
            patch.object(order_routes, "_get_order", side_effect=get_order_after_commit),
            patch.object(order_routes, "notify_order_placed", side_effect=notification),
        ):
            await order_routes.create_order(payload, db)

        self.assertEqual(events, ["commit", "reload", "notify"])

    async def test_unchanged_status_does_not_notify(self):
        order = make_order()
        db = AsyncMock()
        with (
            patch.object(order_routes, "_get_order", new=AsyncMock(return_value=order)),
            patch.object(order_routes, "notify_order_status_updated") as notification,
        ):
            with self.assertRaises(order_routes.HTTPException) as raised:
                await order_routes.update_order_status(
                    order.id,
                    OrderUpdateStatus(status=OrderStatus.PLACED),
                    None,
                    db,
                )

        self.assertEqual(raised.exception.status_code, 409)
        db.commit.assert_not_awaited()
        notification.assert_not_awaited()

    async def test_status_update_notifies_after_commit(self):
        order = make_order()
        order.status = OrderStatus.PLACED
        events = []
        db = AsyncMock()
        db.commit.side_effect = lambda: events.append("commit")

        async def get_order_after_commit(*_args):
            events.append("reload")
            return order

        async def notification(*_args):
            events.append("notify")

        with (
            patch.object(order_routes, "_get_order", side_effect=get_order_after_commit),
            patch.object(
                order_routes,
                "notify_order_status_updated",
                side_effect=notification,
            ),
        ):
            await order_routes.update_order_status(
                order.id,
                OrderUpdateStatus(status=OrderStatus.UNDER_REVIEW),
                None,
                db,
            )

        self.assertEqual(events, ["reload", "commit", "reload", "notify"])
