import secrets
import unittest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import MagicMock, patch
from uuid import uuid4

import httpx
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.db.dependencies import get_db
from app.db.session import engine
from app.main import app
from app.models.admin import Admin, AdminRole
from app.models.category import Category
from app.models.contact_message import ContactMessage
from app.models.hero import Hero
from app.models.order import Order


class BackendAPITests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.original_settings = {
            "JWT_SECRET_KEY": settings.JWT_SECRET_KEY,
            "S3_ENDPOINT_URL": settings.S3_ENDPOINT_URL,
            "S3_ACCESS_KEY_ID": settings.S3_ACCESS_KEY_ID,
            "S3_SECRET_ACCESS_KEY": settings.S3_SECRET_ACCESS_KEY,
            "S3_BUCKET_NAME": settings.S3_BUCKET_NAME,
            "APPS_SCRIPT_EMAIL_NOTIFICATION_URL": settings.APPS_SCRIPT_EMAIL_NOTIFICATION_URL,
            "APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET": settings.APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET,
        }
        self.original_engine_echo = engine.echo
        engine.echo = False
        settings.JWT_SECRET_KEY = secrets.token_urlsafe(48)
        settings.S3_ENDPOINT_URL = None
        settings.S3_ACCESS_KEY_ID = None
        settings.S3_SECRET_ACCESS_KEY = None
        settings.S3_BUCKET_NAME = None
        settings.APPS_SCRIPT_EMAIL_NOTIFICATION_URL = None
        settings.APPS_SCRIPT_EMAIL_NOTIFICATION_SECRET = None

        self.connection = await engine.connect()
        self.transaction = await self.connection.begin()
        self.seed = AsyncSession(
            bind=self.connection,
            expire_on_commit=False,
            join_transaction_mode="create_savepoint",
        )
        self.unique = uuid4().hex[:12]
        self.admin = Admin(
            email=f"api-test-{self.unique}@example.test",
            password_hash=hash_password("correct-horse-test-password"),
            full_name="API Integration Admin",
            role=AdminRole.ADMIN,
            is_active=True,
        )
        self.seed.add(self.admin)
        await self.seed.commit()

        app.dependency_overrides.clear()

        async def override_get_db():
            async with AsyncSession(
                bind=self.connection,
                expire_on_commit=False,
                join_transaction_mode="create_savepoint",
            ) as session:
                yield session

        app.dependency_overrides[get_db] = override_get_db
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        )
        login_response = await self.client.post(
            "/api/admin/auth/login",
            json={
                "email": self.admin.email,
                "password": "correct-horse-test-password",
            },
        )
        self.assertEqual(login_response.status_code, 200, login_response.text)
        self.token = login_response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    async def asyncTearDown(self):
        await self.client.aclose()
        app.dependency_overrides.clear()
        await self.seed.close()
        await self.transaction.rollback()
        await self.connection.close()
        await engine.dispose()
        engine.echo = self.original_engine_echo
        for name, value in self.original_settings.items():
            setattr(settings, name, value)

    async def create_category(self, name: str = "Test category") -> dict:
        response = await self.client.post(
            "/api/categories",
            headers=self.headers,
            json={
                "name": f"{name} {self.unique}",
                "slug": f"{name.lower().replace(' ', '-')}-{self.unique}",
            },
        )
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    async def create_product(
        self,
        category_id: str,
        *,
        name: str = "Test product",
        price: str = "100.00",
    ) -> dict:
        response = await self.client.post(
            "/api/products/",
            headers=self.headers,
            json={
                "name": f"{name} {self.unique}",
                "slug": f"{name.lower().replace(' ', '-')}-{self.unique}",
                "category_id": category_id,
                "price": price,
            },
        )
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    async def create_coupon(self, code: str, **overrides) -> dict:
        payload = {
            "code": f"{code}-{self.unique}",
            "discount_type": "percentage",
            "discount_value": "10.00",
            "is_active": True,
        }
        payload.update(overrides)
        response = await self.client.post(
            "/api/coupons/",
            headers=self.headers,
            json=payload,
        )
        self.assertEqual(response.status_code, 201, response.text)
        return response.json()

    async def test_coupon_expiry_is_reported_without_mutating_or_deleting(self):
        future_end_date = (
            datetime.now(timezone.utc) + timedelta(days=30)
        ).isoformat()
        future_coupon = await self.create_coupon(
            "FUTURE-EXPIRY",
            end_date=future_end_date,
        )
        expired_coupon = await self.create_coupon(
            "PAST-EXPIRY",
            end_date="2020-01-01T00:00:00Z",
        )
        inactive_coupon = await self.create_coupon(
            "MANUALLY-INACTIVE",
            end_date=future_end_date,
            is_active=False,
        )

        listed_coupons = await self.client.get(
            "/api/coupons/",
            headers=self.headers,
        )
        self.assertEqual(listed_coupons.status_code, 200)
        coupons_by_id = {
            coupon["id"]: coupon for coupon in listed_coupons.json()
        }

        self.assertFalse(coupons_by_id[future_coupon["id"]]["is_expired"])
        self.assertTrue(coupons_by_id[future_coupon["id"]]["is_active"])
        self.assertTrue(coupons_by_id[expired_coupon["id"]]["is_expired"])
        self.assertTrue(coupons_by_id[expired_coupon["id"]]["is_active"])
        self.assertFalse(coupons_by_id[inactive_coupon["id"]]["is_expired"])
        self.assertFalse(coupons_by_id[inactive_coupon["id"]]["is_active"])

        future_apply = await self.client.post(
            "/api/coupons/apply",
            json={"code": future_coupon["code"], "order_amount": "100"},
        )
        expired_apply = await self.client.post(
            "/api/coupons/apply",
            json={"code": expired_coupon["code"], "order_amount": "100"},
        )
        inactive_apply = await self.client.post(
            "/api/coupons/apply",
            json={"code": inactive_coupon["code"], "order_amount": "100"},
        )
        self.assertEqual(future_apply.status_code, 200)
        self.assertEqual(expired_apply.status_code, 400)
        self.assertEqual(inactive_apply.status_code, 400)

        retained_expired_coupon = await self.client.get(
            f"/api/coupons/{expired_coupon['id']}",
            headers=self.headers,
        )
        self.assertEqual(retained_expired_coupon.status_code, 200)
        self.assertTrue(retained_expired_coupon.json()["is_expired"])
        self.assertTrue(retained_expired_coupon.json()["is_active"])

        deleted = await self.client.delete(
            f"/api/coupons/{expired_coupon['id']}",
            headers=self.headers,
        )
        self.assertEqual(deleted.status_code, 204)
        missing = await self.client.get(
            f"/api/coupons/{expired_coupon['id']}",
            headers=self.headers,
        )
        self.assertEqual(missing.status_code, 404)

    async def test_admin_auth_and_order_management(self):
        self.assertTrue(
            verify_password(
                "correct-horse-test-password",
                self.admin.password_hash,
            )
        )
        self.assertFalse(verify_password("incorrect", self.admin.password_hash))

        invalid_login = await self.client.post(
            "/api/admin/auth/login",
            json={"email": self.admin.email, "password": "incorrect"},
        )
        self.assertEqual(invalid_login.status_code, 401)
        profile = await self.client.get("/api/admin/auth/me", headers=self.headers)
        self.assertEqual(profile.status_code, 200)
        self.assertNotIn("password_hash", profile.text)

        missing_token = await self.client.get("/api/admin/orders")
        invalid_token = await self.client.get(
            "/api/admin/orders",
            headers={"Authorization": "Bearer invalid.token.value"},
        )
        self.assertEqual(missing_token.status_code, 401)
        self.assertEqual(invalid_token.status_code, 401)

        category = await self.create_category()
        product = await self.create_product(category["id"])
        other_product = await self.create_product(
            category["id"],
            name="Other product",
            price="50.00",
        )
        variant_response = await self.client.post(
            "/api/product-variants",
            headers=self.headers,
            json={
                "product_id": product["id"],
                "name": "Priced variant",
                "sku": f"SKU-{self.unique}",
                "price": "150.00",
            },
        )
        self.assertEqual(variant_response.status_code, 201, variant_response.text)
        variant = variant_response.json()
        other_variant_response = await self.client.post(
            "/api/product-variants",
            headers=self.headers,
            json={
                "product_id": other_product["id"],
                "name": "Other variant",
                "sku": f"OTHER-{self.unique}",
            },
        )
        self.assertEqual(other_variant_response.status_code, 201, other_variant_response.text)
        other_variant = other_variant_response.json()

        coupon = await self.create_coupon(
            "ORDER",
            minimum_order_amount="100.00",
            maximum_discount_amount="25.00",
            usage_limit=1,
            start_date="2020-01-01T00:00:00Z",
            end_date="2030-01-01T00:00:00Z",
        )
        order_payload = {
            "customer_name": "Test Customer",
            "customer_phone": f"555{self.unique[:8]}",
            "notes": "Audit order note",
            "items": [
                {
                    "product_id": product["id"],
                    "product_variant_id": variant["id"],
                    "quantity": 2,
                    "unit_price": "0.01",
                }
            ],
            "coupon_code": coupon["code"],
        }
        missing_product_order = dict(order_payload)
        missing_product_order["items"] = [{"product_id": str(uuid4()), "quantity": 1}]
        self.assertEqual(
            (await self.client.post("/api/orders/", json=missing_product_order)).status_code,
            404,
        )

        wrong_variant_order = dict(order_payload)
        wrong_variant_order["items"] = [
            {
                "product_id": product["id"],
                "product_variant_id": other_variant["id"],
                "quantity": 1,
            }
        ]
        self.assertEqual(
            (await self.client.post("/api/orders/", json=wrong_variant_order)).status_code,
            400,
        )
        invalid_quantity = dict(order_payload)
        invalid_quantity["items"] = [{"product_id": product["id"], "quantity": 0}]
        self.assertEqual(
            (await self.client.post("/api/orders/", json=invalid_quantity)).status_code,
            422,
        )
        missing_phone = dict(order_payload)
        missing_phone.pop("customer_phone")
        self.assertEqual(
            (await self.client.post("/api/orders/", json=missing_phone)).status_code,
            422,
        )

        deactivated_product = await self.client.patch(
            f"/api/products/{product['id']}",
            headers=self.headers,
            json={"is_active": False},
        )
        self.assertEqual(deactivated_product.status_code, 200)
        self.assertEqual(
            (await self.client.post("/api/orders/", json=order_payload)).status_code,
            404,
        )
        self.assertEqual(
            (await self.client.get(f"/api/coupons/{coupon['id']}", headers=self.headers)).json()["used_count"],
            0,
        )
        reactivated_product = await self.client.patch(
            f"/api/products/{product['id']}",
            headers=self.headers,
            json={"is_active": True},
        )
        self.assertEqual(reactivated_product.status_code, 200)

        created = await self.client.post("/api/orders/", json=order_payload)
        self.assertEqual(created.status_code, 201, created.text)
        order = created.json()
        self.assertEqual(order["items"][0]["unit_price"], "150.00")
        self.assertEqual(order["items"][0]["subtotal"], "300.00")
        self.assertEqual(order["subtotal"], "300.00")
        self.assertEqual(order["shipping_fee"], "0.00")
        self.assertEqual(order["discount_amount"], "25.00")
        self.assertEqual(order["final_amount"], "275.00")
        self.assertEqual(order["status"], "placed")
        self.assertIsNone(order["customer_email"])
        self.assertEqual(order["notes"], "Audit order note")
        order_id = order["id"]

        exhausted_coupon = await self.client.post("/api/orders/", json=order_payload)
        self.assertEqual(exhausted_coupon.status_code, 400)
        stored_coupon = await self.client.get(
            f"/api/coupons/{coupon['id']}",
            headers=self.headers,
        )
        self.assertEqual(stored_coupon.json()["used_count"], 1)

        self.assertEqual((await self.client.get(f"/api/orders/{order_id}")).status_code, 200)
        by_phone = await self.client.get(
            f"/api/orders/phone/{order_payload['customer_phone']}"
        )
        self.assertEqual(len(by_phone.json()), 1)
        self.assertEqual((await self.client.get(f"/api/orders/{uuid4()}")).status_code, 404)
        self.assertEqual((await self.client.get("/api/orders/phone/55500000000")).json(), [])

        forbidden_update = await self.client.patch(
            f"/api/orders/{order_id}/items",
            json={"items": [{"product_id": product["id"], "quantity": 3}]},
        )
        self.assertEqual(forbidden_update.status_code, 401)
        bad_item_update = await self.client.patch(
            f"/api/orders/{order_id}/items",
            headers=self.headers,
            json={
                "items": [
                    {
                        "product_id": product["id"],
                        "product_variant_id": other_variant["id"],
                        "quantity": 1,
                    }
                ]
            },
        )
        self.assertEqual(bad_item_update.status_code, 400)
        updated_items = await self.client.patch(
            f"/api/orders/{order_id}/items",
            headers=self.headers,
            json={"items": [{"product_id": product["id"], "quantity": 3}]},
        )
        self.assertEqual(updated_items.status_code, 200, updated_items.text)
        self.assertEqual(updated_items.json()["subtotal"], "300.00")
        self.assertEqual(updated_items.json()["discount_amount"], "25.00")
        self.assertEqual(updated_items.json()["final_amount"], "275.00")
        self.assertEqual(
            (await self.client.get(f"/api/coupons/{coupon['id']}", headers=self.headers)).json()["used_count"],
            1,
        )

        skipped_status = await self.client.patch(
            f"/api/orders/{order_id}/status",
            headers=self.headers,
            json={"status": "shipped"},
        )
        self.assertEqual(skipped_status.status_code, 409)
        invalid_status = await self.client.patch(
            f"/api/orders/{order_id}/status",
            headers=self.headers,
            json={"status": "cancelled"},
        )
        self.assertEqual(invalid_status.status_code, 422)
        for order_status in ("under_review", "confirmed", "shipped"):
            status_response = await self.client.patch(
                f"/api/orders/{order_id}/status",
                headers=self.headers,
                json={"status": order_status},
            )
            self.assertEqual(status_response.status_code, 200, status_response.text)
            self.assertEqual(status_response.json()["status"], order_status)

        admin_orders = await self.client.get("/api/admin/orders", headers=self.headers)
        self.assertEqual(admin_orders.status_code, 200)
        self.assertIn(order_id, [item["id"] for item in admin_orders.json()])
        self.assertEqual(
            (await self.client.get(f"/api/admin/orders/{order_id}", headers=self.headers)).status_code,
            200,
        )

        self.admin.is_active = False
        await self.seed.commit()
        self.assertEqual(
            (await self.client.get("/api/admin/orders", headers=self.headers)).status_code,
            401,
        )
        self.admin.is_active = True
        await self.seed.commit()
        self.assertEqual(
            (await self.client.get("/api/admin/orders", headers=self.headers)).status_code,
            200,
        )

        await self.seed.execute(delete(Order).where(Order.id == order_id))
        await self.seed.commit()

    async def test_individual_product_discounts_and_order_price_snapshots(self):
        category = Category(
            name=f"Discount Test {self.unique}",
            product_type="saree",
            saree="Kanchipuram",
            is_active=True,
        )
        self.seed.add(category)
        await self.seed.commit()

        async def create_discount_product(payload):
            response = await self.client.post(
                "/api/products/",
                headers=self.headers,
                json={
                    "name": f"Discount product {self.unique}",
                    "category_id": str(category.id),
                    **payload,
                },
            )
            return response

        percentage_response = await create_discount_product(
            {
                "price": "200.00",
                "discount_type": "percentage",
                "discount_value": "25",
            }
        )
        self.assertEqual(percentage_response.status_code, 201, percentage_response.text)
        percentage_product = percentage_response.json()
        self.assertEqual(percentage_product["price"], "150.00")
        self.assertEqual(percentage_product["mrp"], "200.00")
        self.assertEqual(percentage_product["discount_percentage"], "25.00")
        self.assertEqual(percentage_product["discount_type"], "percentage")

        fixed_response = await create_discount_product(
            {
                "price": "1000.00",
                "discount_type": "fixed_price",
                "discount_value": "799.00",
            }
        )
        self.assertEqual(fixed_response.status_code, 201, fixed_response.text)
        fixed_product = fixed_response.json()
        self.assertEqual(fixed_product["price"], "799.00")
        self.assertEqual(fixed_product["mrp"], "1000.00")
        self.assertIsNone(fixed_product["discount_percentage"])
        self.assertEqual(fixed_product["discount_type"], "fixed_price")

        regular_response = await create_discount_product({"price": "450.00"})
        self.assertEqual(regular_response.status_code, 201, regular_response.text)
        regular_product = regular_response.json()
        self.assertEqual(regular_product["price"], "450.00")
        self.assertIsNone(regular_product["mrp"])
        self.assertEqual(regular_product["discount_type"], "none")

        for invalid_discount in (
            {"discount_type": "percentage", "discount_value": "-1"},
            {"discount_type": "percentage", "discount_value": "100"},
            {"discount_type": "fixed_price", "discount_value": "0"},
            {"discount_type": "fixed_price", "discount_value": "1001"},
        ):
            invalid_response = await create_discount_product(
                {"price": "1000.00", **invalid_discount}
            )
            self.assertEqual(invalid_response.status_code, 422, invalid_response.text)

        variant_response = await self.client.post(
            "/api/product-variants",
            headers=self.headers,
            json={
                "product_id": percentage_product["id"],
                "name": "Discounted variant",
                "sku": f"DISCOUNT-{self.unique}",
                "price": "400.00",
            },
        )
        self.assertEqual(variant_response.status_code, 201, variant_response.text)
        variant = variant_response.json()

        order_response = await self.client.post(
            "/api/orders/",
            json={
                "customer_name": "Discount Test Customer",
                "customer_phone": f"555{self.unique[:8]}",
                "subtotal": "0.01",
                "total_amount": "0.01",
                "final_amount": "0.01",
                "items": [
                    {
                        "product_id": percentage_product["id"],
                        "quantity": 2,
                        "unit_price": "0.01",
                        "subtotal": "0.01",
                    },
                    {
                        "product_id": fixed_product["id"],
                        "quantity": 1,
                        "unit_price": "0.01",
                    },
                    {
                        "product_id": regular_product["id"],
                        "quantity": 1,
                        "unit_price": "0.01",
                    },
                    {
                        "product_id": percentage_product["id"],
                        "product_variant_id": variant["id"],
                        "quantity": 1,
                        "unit_price": "0.01",
                    },
                ],
            },
        )
        self.assertEqual(order_response.status_code, 201, order_response.text)
        order = order_response.json()
        items_by_product = {
            item["product_id"]: item for item in order["items"] if item["product_sku"] is None
        }
        percentage_item = items_by_product[percentage_product["id"]]
        fixed_item = items_by_product[fixed_product["id"]]
        regular_item = items_by_product[regular_product["id"]]
        variant_item = next(
            item
            for item in order["items"]
            if item["product_variant_id"] == variant["id"]
        )

        self.assertEqual(percentage_item["unit_price"], "150.00")
        self.assertEqual(percentage_item["subtotal"], "300.00")
        self.assertEqual(fixed_item["unit_price"], "799.00")
        self.assertEqual(regular_item["unit_price"], "450.00")
        self.assertEqual(variant_item["unit_price"], "300.00")
        self.assertEqual(order["subtotal"], "1849.00")
        self.assertEqual(order["total_amount"], "1849.00")
        self.assertEqual(order["final_amount"], "1849.00")

        update_response = await self.client.patch(
            f"/api/products/{fixed_product['id']}",
            headers=self.headers,
            json={
                "price": "1000.00",
                "mrp": "1000.00",
                "discount_type": "fixed_price",
                "discount_value": "500.00",
            },
        )
        self.assertEqual(update_response.status_code, 200, update_response.text)
        self.assertEqual(update_response.json()["price"], "500.00")

        historical_order = await self.client.get(f"/api/orders/{order['id']}")
        self.assertEqual(historical_order.status_code, 200)
        historical_item = next(
            item
            for item in historical_order.json()["items"]
            if item["product_id"] == fixed_product["id"]
        )
        self.assertEqual(historical_item["unit_price"], "799.00")
        self.assertEqual(historical_item["subtotal"], "799.00")
        self.assertEqual(historical_order.json()["subtotal"], "1849.00")

        remove_response = await self.client.patch(
            f"/api/products/{fixed_product['id']}",
            headers=self.headers,
            json={"discount_type": "none"},
        )
        self.assertEqual(remove_response.status_code, 200, remove_response.text)
        self.assertEqual(remove_response.json()["price"], "1000.00")
        self.assertIsNone(remove_response.json()["mrp"])
        self.assertEqual(remove_response.json()["discount_type"], "none")

    async def test_admin_contact_message_management(self):
        unauthenticated = await self.client.get("/api/admin/messages")
        self.assertEqual(unauthenticated.status_code, 401)

        contact_response = await self.client.post(
            "/api/contact",
            json={
                "name": "Message Test Customer",
                "email": "message-test@example.com",
                "subject": f"Message search {self.unique}",
                "message": "Please help me choose a silk saree for my event.",
            },
        )
        self.assertEqual(contact_response.status_code, 201, contact_response.text)
        message = contact_response.json()
        self.assertEqual(message["status"], "New")

        search_response = await self.client.get(
            "/api/admin/messages",
            headers=self.headers,
            params={"query": self.unique, "status": "New"},
        )
        self.assertEqual(search_response.status_code, 200, search_response.text)
        self.assertEqual([item["id"] for item in search_response.json()], [message["id"]])
        self.assertIn("message_preview", search_response.json()[0])

        detail_response = await self.client.get(
            f"/api/admin/messages/{message['id']}",
            headers=self.headers,
        )
        self.assertEqual(detail_response.status_code, 200, detail_response.text)
        self.assertEqual(
            detail_response.json()["message"],
            "Please help me choose a silk saree for my event.",
        )

        updated_response = await self.client.patch(
            f"/api/admin/messages/{message['id']}/status",
            headers=self.headers,
            json={"status": "Read"},
        )
        self.assertEqual(updated_response.status_code, 200, updated_response.text)
        self.assertEqual(updated_response.json()["status"], "Read")

        read_messages = await self.client.get(
            "/api/admin/messages",
            headers=self.headers,
            params={"status": "Read"},
        )
        self.assertIn(message["id"], [item["id"] for item in read_messages.json()])
        invalid_status = await self.client.patch(
            f"/api/admin/messages/{message['id']}/status",
            headers=self.headers,
            json={"status": "Archived"},
        )
        self.assertEqual(invalid_status.status_code, 422)

        self.assertEqual(
            (
                await self.client.get(
                    f"/api/admin/messages/{message['id']}"
                )
            ).status_code,
            401,
        )
        await self.seed.execute(
            delete(ContactMessage).where(ContactMessage.id == message["id"])
        )
        await self.seed.commit()

    async def test_catalog_review_coupon_and_image_apis(self):
        unauthenticated_write = await self.client.post(
            "/api/categories",
            json={"name": "No auth", "slug": f"no-auth-{self.unique}"},
        )
        self.assertEqual(unauthenticated_write.status_code, 401)

        category = await self.create_category("Catalog")
        categories = await self.client.get("/api/categories")
        self.assertIn(category["id"], [item["id"] for item in categories.json()])
        self.assertEqual((await self.client.get(f"/api/categories/{category['id']}")).status_code, 200)
        updated_category = await self.client.patch(
            f"/api/categories/{category['id']}",
            headers=self.headers,
            json={"description": "Updated description"},
        )
        self.assertEqual(updated_category.status_code, 200)
        missing_parent = await self.client.post(
            "/api/categories",
            headers=self.headers,
            json={
                "name": f"Missing parent {self.unique}",
                "slug": f"missing-parent-{self.unique}",
                "parent_id": str(uuid4()),
            },
        )
        self.assertEqual(missing_parent.status_code, 404)
        child_response = await self.client.post(
            "/api/categories",
            headers=self.headers,
            json={
                "name": f"Child {self.unique}",
                "slug": f"child-{self.unique}",
                "parent_id": category["id"],
            },
        )
        self.assertEqual(child_response.status_code, 201, child_response.text)
        child = child_response.json()
        self.assertEqual(child["parent_id"], category["id"])
        grandchild_response = await self.client.post(
            "/api/categories",
            headers=self.headers,
            json={
                "name": f"Grandchild {self.unique}",
                "slug": f"grandchild-{self.unique}",
                "parent_id": child["id"],
            },
        )
        self.assertEqual(grandchild_response.status_code, 201, grandchild_response.text)
        grandchild = grandchild_response.json()
        self.assertEqual(
            (await self.client.patch(
                f"/api/categories/{category['id']}",
                headers=self.headers,
                json={"parent_id": grandchild["id"]},
            )).status_code,
            400,
        )

        product = await self.create_product(category["id"])
        products = await self.client.get("/api/products/")
        self.assertIn(product["id"], [item["id"] for item in products.json()])
        self.assertEqual((await self.client.get(f"/api/products/{product['id']}")).status_code, 200)
        updated_product = await self.client.patch(
            f"/api/products/{product['id']}",
            headers=self.headers,
            json={"price": "125.00"},
        )
        self.assertEqual(updated_product.status_code, 200)
        self.assertEqual(updated_product.json()["price"], "125.00")

        variant_response = await self.client.post(
            "/api/product-variants",
            headers=self.headers,
            json={
                "product_id": product["id"],
                "name": "Catalog variant",
                "sku": f"CAT-{self.unique}",
                "price": "130.00",
            },
        )
        self.assertEqual(variant_response.status_code, 201, variant_response.text)
        variant = variant_response.json()
        variants = await self.client.get("/api/product-variants")
        self.assertIn(variant["id"], [item["id"] for item in variants.json()])
        self.assertEqual((await self.client.get(f"/api/product-variants/{variant['id']}")).status_code, 200)
        updated_variant = await self.client.patch(
            f"/api/product-variants/{variant['id']}",
            headers=self.headers,
            json={"price": "140.00"},
        )
        self.assertEqual(updated_variant.status_code, 200)

        image_response = await self.client.post(
            "/api/product-images/",
            headers=self.headers,
            json={
                "product_id": product["id"],
                "image_url": "https://example.test/image.png",
                "alt_text": "Test image",
            },
        )
        self.assertEqual(image_response.status_code, 201, image_response.text)
        image = image_response.json()
        product_images = await self.client.get(f"/api/product-images/product/{product['id']}")
        self.assertIn(image["id"], [item["id"] for item in product_images.json()])
        self.assertEqual((await self.client.get(f"/api/product-images/{image['id']}")).status_code, 200)
        updated_image = await self.client.patch(
            f"/api/product-images/{image['id']}",
            headers=self.headers,
            json={"alt_text": "Updated image"},
        )
        self.assertEqual(updated_image.status_code, 200)

        review_response = await self.client.post(
            "/api/reviews/",
            json={
                "product_id": product["id"],
                "customer_name": "Customer",
                "rating": 5,
                "comment": "Excellent",
            },
        )
        self.assertEqual(review_response.status_code, 201, review_response.text)
        review = review_response.json()
        self.assertEqual(review["status"], "pending")
        product_reviews = await self.client.get(f"/api/reviews/product/{product['id']}")
        self.assertIn(review["id"], [item["id"] for item in product_reviews.json()])
        self.assertEqual((await self.client.get(f"/api/reviews/{review['id']}")).status_code, 200)
        self.assertEqual(
            (await self.client.patch(f"/api/reviews/{review['id']}", json={"status": "approved"})).status_code,
            401,
        )
        approved = await self.client.patch(
            f"/api/reviews/{review['id']}",
            headers=self.headers,
            json={"status": "approved"},
        )
        self.assertEqual(approved.status_code, 200)
        rejected = await self.client.patch(
            f"/api/reviews/{review['id']}",
            headers=self.headers,
            json={"status": "rejected"},
        )
        self.assertEqual(rejected.status_code, 200)
        self.assertEqual(rejected.json()["status"], "rejected")
        self.assertEqual(
            (await self.client.delete(f"/api/reviews/{review['id']}", headers=self.headers)).status_code,
            204,
        )

        percentage = await self.create_coupon(
            "PERCENT",
            discount_value="50.00",
            minimum_order_amount="100.00",
            maximum_discount_amount="20.00",
            usage_limit=3,
            start_date="2020-01-01T00:00:00Z",
            end_date="2030-01-01T00:00:00Z",
        )
        self.assertEqual((await self.client.get("/api/coupons/")).status_code, 401)
        coupon_list = await self.client.get("/api/coupons/", headers=self.headers)
        self.assertIn(percentage["id"], [item["id"] for item in coupon_list.json()])
        self.assertEqual(
            (await self.client.get(f"/api/coupons/{percentage['id']}", headers=self.headers)).status_code,
            200,
        )
        capped_discount = await self.client.post(
            "/api/coupons/apply",
            json={"code": percentage["code"], "order_amount": "200.00"},
        )
        self.assertEqual(capped_discount.status_code, 200)
        self.assertEqual(capped_discount.json()["discount_amount"], "20.00")
        self.assertEqual(
            (await self.client.post(
                "/api/coupons/apply",
                json={"code": percentage["code"], "order_amount": "50.00"},
            )).status_code,
            400,
        )

        unsupported_coupon = await self.client.post(
            "/api/coupons/",
            headers=self.headers,
            json={"code": f"BAD-{self.unique}", "discount_type": "bogus", "discount_value": "5"},
        )
        self.assertEqual(unsupported_coupon.status_code, 422)
        unsupported_update = await self.client.patch(
            f"/api/coupons/{percentage['id']}",
            headers=self.headers,
            json={"discount_type": "bogus"},
        )
        self.assertEqual(unsupported_update.status_code, 422)
        updated_coupon = await self.client.patch(
            f"/api/coupons/{percentage['id']}",
            headers=self.headers,
            json={"discount_type": "fixed", "discount_value": "15.00"},
        )
        self.assertEqual(updated_coupon.status_code, 200)
        self.assertEqual(updated_coupon.json()["discount_type"], "fixed")

        fixed_coupon = await self.create_coupon(
            "FIXED",
            discount_type="fixed",
            discount_value="25.00",
        )
        fixed_discount = await self.client.post(
            "/api/coupons/apply",
            json={"code": fixed_coupon["code"], "order_amount": "100.00"},
        )
        self.assertEqual(fixed_discount.status_code, 200)
        self.assertEqual(fixed_discount.json()["discount_amount"], "25.00")
        future_coupon = await self.create_coupon(
            "FUTURE",
            start_date="2030-01-01T00:00:00Z",
        )
        future_result = await self.client.post(
            "/api/coupons/apply",
            json={"code": future_coupon["code"], "order_amount": "100"},
        )
        self.assertEqual(future_result.status_code, 400)
        expired_coupon = await self.create_coupon(
            "EXPIRED",
            start_date="2019-01-01T00:00:00Z",
            end_date="2020-01-01T00:00:00Z",
        )
        expired_result = await self.client.post(
            "/api/coupons/apply",
            json={"code": expired_coupon["code"], "order_amount": "100"},
        )
        self.assertEqual(expired_result.status_code, 400)
        inactive = await self.client.patch(
            f"/api/coupons/{fixed_coupon['id']}",
            headers=self.headers,
            json={"is_active": False},
        )
        self.assertEqual(inactive.status_code, 200)
        inactive_result = await self.client.post(
            "/api/coupons/apply",
            json={"code": fixed_coupon["code"], "order_amount": "100"},
        )
        self.assertEqual(inactive_result.status_code, 400)

        for coupon in (percentage, fixed_coupon, future_coupon, expired_coupon):
            deleted_coupon = await self.client.delete(
                f"/api/coupons/{coupon['id']}",
                headers=self.headers,
            )
            self.assertEqual(deleted_coupon.status_code, 204)

        self.assertEqual(
            (await self.client.delete(f"/api/product-images/{image['id']}", headers=self.headers)).status_code,
            204,
        )
        self.assertEqual(
            (await self.client.delete(f"/api/product-variants/{variant['id']}", headers=self.headers)).status_code,
            204,
        )
        upload_unauthorized = await self.client.post(
            f"/api/product-images/upload/{product['id']}",
            files={"image": ("test.png", b"image", "image/png")},
        )
        self.assertEqual(upload_unauthorized.status_code, 401)
        upload_unconfigured = await self.client.post(
            f"/api/product-images/upload/{product['id']}",
            headers=self.headers,
            files={"image": ("test.png", b"image", "image/png")},
        )
        self.assertEqual(upload_unconfigured.status_code, 503)
        self.assertIn("S3_ENDPOINT_URL", upload_unconfigured.json()["detail"])

        self.assertEqual(
            (await self.client.delete(f"/api/products/{product['id']}", headers=self.headers)).status_code,
            204,
        )
        self.assertEqual(
            (await self.client.delete(f"/api/categories/{category['id']}", headers=self.headers)).status_code,
            204,
        )

    async def test_hero_slides_require_admin_and_enforce_active_limits(self):
        await self.seed.execute(delete(Hero))
        await self.seed.commit()

        self.assertEqual(
            (await self.client.get("/api/hero-slides/")).status_code,
            401,
        )
        initial_slides_response = await self.client.get(
            "/api/hero-slides/",
            headers=self.headers,
        )
        self.assertEqual(initial_slides_response.status_code, 200)
        initial_slides = initial_slides_response.json()
        initial_active_ids = {
            slide["id"] for slide in initial_slides if slide["is_active"]
        }
        self.assertEqual(
            {
                slide["id"]
                for slide in (
                    await self.client.get("/api/hero-slides/active")
                ).json()
            },
            initial_active_ids,
        )
        self.assertEqual(
            (
                await self.client.post(
                    "/api/hero-slides/",
                    files={"image": ("banner.png", b"unauthorized", "image/png")},
                    data={
                        "heading": "Unauthorized",
                        "description": "Should not be accepted.",
                        "cta_text": "Explore",
                        "cta_url": "/collections",
                        "is_active": "true",
                    },
                )
            ).status_code,
            401,
        )

        storage_client = MagicMock()
        image = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16
        created_slides = []
        available_slots = 4 - len(initial_active_ids)
        self.assertGreater(available_slots, 0)
        with patch(
            "app.services.hero_images.get_storage_client",
            return_value=(
                storage_client,
                "test-bucket",
                "https://images.example.test",
            ),
        ):
            for index in range(available_slots):
                response = await self.client.post(
                    "/api/hero-slides/",
                    headers=self.headers,
                    data={
                        "heading": f"Slide {index + 1}",
                        "description": "A handwoven silk collection.",
                        "cta_text": "Explore",
                        "cta_url": "/collections",
                        "is_active": "true",
                    },
                    files={"image": (f"banner-{index}.png", image, "image/png")},
                )
                self.assertEqual(response.status_code, 201, response.text)
                created_slides.append(response.json())

            over_limit = await self.client.post(
                "/api/hero-slides/",
                headers=self.headers,
                data={
                    "heading": "Slide 5",
                    "description": "A new collection.",
                    "cta_text": "Explore",
                    "cta_url": "javascript:alert(1)",
                    "is_active": "true",
                },
                files={"image": ("banner.png", image, "image/png")},
            )
            self.assertEqual(over_limit.status_code, 422)
            self.assertIn("CTA URL", over_limit.text)

            active_limit = await self.client.post(
                "/api/hero-slides/",
                headers=self.headers,
                data={
                    "heading": "Slide 5",
                    "description": "A new collection.",
                    "cta_text": "Explore",
                    "cta_url": "/collections",
                    "is_active": "true",
                },
                files={"image": ("banner.png", image, "image/png")},
            )
            self.assertEqual(active_limit.status_code, 409)

            invalid_image = await self.client.post(
                "/api/hero-slides/",
                headers=self.headers,
                data={
                    "heading": "Invalid image",
                    "description": "This file is not a JPEG.",
                    "cta_text": "Explore",
                    "cta_url": "/collections",
                    "is_active": "false",
                },
                files={"image": ("banner.jpg", image, "image/jpeg")},
            )
            self.assertEqual(invalid_image.status_code, 415)

            deactivate = await self.client.patch(
                f"/api/hero-slides/{created_slides[0]['id']}/status",
                headers=self.headers,
                json={"is_active": False},
            )
            self.assertEqual(deactivate.status_code, 200)
            if available_slots > 1:
                replacement_required = await self.client.patch(
                    f"/api/hero-slides/{created_slides[1]['id']}/status",
                    headers=self.headers,
                    json={"is_active": False},
                )
                self.assertEqual(replacement_required.status_code, 409)

            update = await self.client.put(
                f"/api/hero-slides/{created_slides[0]['id']}",
                headers=self.headers,
                data={
                    "heading": "Updated slide",
                    "description": "Updated description.",
                    "cta_text": "Shop now",
                    "cta_url": "https://example.test/collection",
                    "is_active": "false",
                },
                files={"image": ("replacement.png", image, "image/png")},
            )
            self.assertEqual(update.status_code, 200, update.text)
            self.assertEqual(update.json()["heading"], "Updated slide")

            all_slides_response = await self.client.get(
                "/api/hero-slides/",
                headers=self.headers,
            )
            all_ids = [slide["id"] for slide in all_slides_response.json()]
            reordered = await self.client.put(
                "/api/hero-slides/reorder",
                headers=self.headers,
                json={
                    "slide_ids": list(reversed(all_ids))
                },
            )
            self.assertEqual(reordered.status_code, 200, reordered.text)
            public_slides = await self.client.get("/api/hero-slides/active")
            active_ids = {
                slide["id"] for slide in public_slides.json()
            }
            self.assertEqual(
                [slide["id"] for slide in public_slides.json()],
                [slide_id for slide_id in reversed(all_ids) if slide_id in active_ids],
            )

            deleted = await self.client.delete(
                f"/api/hero-slides/{created_slides[0]['id']}",
                headers=self.headers,
            )
            self.assertEqual(deleted.status_code, 204)
            self.assertTrue(storage_client.upload_fileobj.called)

    async def test_hero_content_update_persists_and_can_replace_image(self):
        await self.seed.execute(delete(Hero))
        await self.seed.commit()

        unauthorized = await self.client.put(
            "/api/hero/",
            data={
                "heading": "Updated hero heading",
                "description": "Updated hero paragraph.",
            },
        )
        self.assertEqual(unauthorized.status_code, 401)

        storage_client = MagicMock()
        image = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16
        with patch(
            "app.services.hero_images.get_storage_client",
            return_value=(
                storage_client,
                "test-bucket",
                "https://images.example.test",
            ),
        ):
            created = await self.client.post(
                "/api/hero/upload",
                headers=self.headers,
                files={"file": ("hero.png", image, "image/png")},
            )
            self.assertEqual(created.status_code, 201, created.text)

            updated = await self.client.put(
                "/api/hero/",
                headers=self.headers,
                data={
                    "heading": "Updated hero heading",
                    "description": "Updated hero paragraph.",
                },
            )
            self.assertEqual(updated.status_code, 200, updated.text)
            self.assertEqual(updated.json()["heading"], "Updated hero heading")
            self.assertEqual(
                updated.json()["description"],
                "Updated hero paragraph.",
            )
            self.assertEqual(
                updated.json()["image_url"],
                created.json()["image_url"],
            )

            refreshed = await self.client.get("/api/hero/")
            self.assertEqual(refreshed.status_code, 200, refreshed.text)
            self.assertEqual(
                refreshed.json()["heading"],
                "Updated hero heading",
            )
            self.assertEqual(
                refreshed.json()["description"],
                "Updated hero paragraph.",
            )

            image_replaced = await self.client.put(
                "/api/hero/",
                headers=self.headers,
                data={
                    "heading": "Final hero heading",
                    "description": "Final hero paragraph.",
                },
                files={"image": ("replacement.png", image, "image/png")},
            )
            self.assertEqual(image_replaced.status_code, 200, image_replaced.text)
            self.assertNotEqual(
                image_replaced.json()["image_url"],
                created.json()["image_url"],
            )
            self.assertEqual(storage_client.upload_fileobj.call_count, 2)

        final_response = await self.client.get("/api/hero/")
        self.assertEqual(final_response.status_code, 200, final_response.text)
        self.assertEqual(final_response.json()["heading"], "Final hero heading")
        self.assertEqual(
            final_response.json()["description"],
            "Final hero paragraph.",
        )


if __name__ == "__main__":
    unittest.main()