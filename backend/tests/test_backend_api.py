import secrets
import unittest
from decimal import Decimal
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
from app.models.order import Order


class BackendAPITests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.original_settings = {
            "JWT_SECRET_KEY": settings.JWT_SECRET_KEY,
            "S3_ENDPOINT_URL": settings.S3_ENDPOINT_URL,
            "S3_ACCESS_KEY_ID": settings.S3_ACCESS_KEY_ID,
            "S3_SECRET_ACCESS_KEY": settings.S3_SECRET_ACCESS_KEY,
            "S3_BUCKET_NAME": settings.S3_BUCKET_NAME,
        }
        self.original_engine_echo = engine.echo
        engine.echo = False
        settings.JWT_SECRET_KEY = secrets.token_urlsafe(48)
        settings.S3_ENDPOINT_URL = None
        settings.S3_ACCESS_KEY_ID = None
        settings.S3_SECRET_ACCESS_KEY = None
        settings.S3_BUCKET_NAME = None

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


if __name__ == "__main__":
    unittest.main()