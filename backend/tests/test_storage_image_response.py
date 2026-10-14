from datetime import datetime, timezone
from uuid import UUID

import pytest

from app.core.config import settings
from app.schemas.category import CategoryResponse
from app.schemas.hero import HeroResponse
from app.schemas.product_image import ProductImageResponse
from app.services.storage import get_public_image_url


@pytest.fixture
def rustfs_settings(monkeypatch):
    monkeypatch.setattr(settings, "S3_BUCKET_NAME", "dera-silk")
    monkeypatch.setattr(
        settings,
        "S3_PUBLIC_BASE_URL",
        "http://localhost:9000/dera-silk",
    )
    monkeypatch.setattr(
        settings,
        "S3_ENDPOINT_URL",
        "http://127.0.0.1:9000/",
    )


@pytest.mark.parametrize(
    ("response_model", "response_fields", "object_key"),
    [
        (
            ProductImageResponse,
            {
                "id": UUID("00000000-0000-0000-0000-000000000001"),
                "product_id": UUID("00000000-0000-0000-0000-000000000002"),
                "alt_text": None,
                "display_order": 0,
                "is_primary": True,
            },
            "products/00000000-0000-0000-0000-000000000002/image.jpg",
        ),
        (
            CategoryResponse,
            {
                "id": UUID("00000000-0000-0000-0000-000000000003"),
                "name": "Silk",
                "product_type": "Saree",
                "saree": "Kanchipuram",
                "description": None,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            },
            "categories/00000000-0000-0000-0000-000000000003/image.jpg",
        ),
        (
            HeroResponse,
            {
                "id": UUID("00000000-0000-0000-0000-000000000004"),
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            },
            "hero/image.jpg",
        ),
    ],
)
def test_image_responses_rebase_old_host_and_keep_object_key(
    rustfs_settings,
    response_model,
    response_fields,
    object_key,
):
    response = response_model.model_validate(
        {
            **response_fields,
            "image_url": f"http://10.50.213.99:9000/dera-silk/{object_key}",
        }
    )

    assert response.image_url == (
        f"http://localhost:9000/dera-silk/{object_key}"
    )


def test_public_image_url_leaves_non_bucket_urls_unchanged(rustfs_settings):
    external_url = "https://images.example.com/silk.jpg"

    assert get_public_image_url(external_url) == external_url


def test_public_image_url_rebases_object_keys(rustfs_settings):
    object_key = "products/product-id/image file.jpg"

    assert get_public_image_url(object_key) == (
        "http://localhost:9000/dera-silk/"
        "products/product-id/image%20file.jpg"
    )
