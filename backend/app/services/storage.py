from urllib.parse import quote, unquote, urlsplit

import boto3
from botocore.config import Config

from app.core.config import settings


def get_public_base_url() -> str | None:
    if settings.S3_PUBLIC_BASE_URL:
        return settings.S3_PUBLIC_BASE_URL.rstrip("/")

    if settings.S3_ENDPOINT_URL and settings.S3_BUCKET_NAME:
        return (
            f"{settings.S3_ENDPOINT_URL.rstrip('/')}/"
            f"{settings.S3_BUCKET_NAME}"
        )

    return None


def get_public_image_url(image_url: str | None) -> str | None:
    if not image_url or not settings.S3_BUCKET_NAME:
        return image_url

    parsed_url = urlsplit(image_url)
    path = unquote(parsed_url.path).lstrip("/")
    bucket_prefix = f"{settings.S3_BUCKET_NAME}/"

    if path.startswith(bucket_prefix):
        object_key = path[len(bucket_prefix):]
    elif not parsed_url.scheme and not parsed_url.netloc and path.startswith(
        ("products/", "categories/", "hero/")
    ):
        object_key = path
    else:
        return image_url

    public_base_url = get_public_base_url()
    if not public_base_url or not object_key:
        return image_url

    return get_image_url(public_base_url, object_key)


def get_storage_client():
    required_settings = {
        "S3_ENDPOINT_URL": settings.S3_ENDPOINT_URL,
        "S3_ACCESS_KEY_ID": settings.S3_ACCESS_KEY_ID,
        "S3_SECRET_ACCESS_KEY": settings.S3_SECRET_ACCESS_KEY,
        "S3_BUCKET_NAME": settings.S3_BUCKET_NAME,
    }
    missing_settings = [name for name, value in required_settings.items() if not value]
    if missing_settings:
        raise RuntimeError(
            "Missing required S3 settings: " + ", ".join(missing_settings)
        )

    client = boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
        region_name=settings.S3_REGION,
        config=Config(s3={"addressing_style": "path"}),
    )
    return client, settings.S3_BUCKET_NAME, get_public_base_url()


def get_image_url(public_base_url: str, object_key: str) -> str:
    return f"{public_base_url}/{quote(object_key, safe='/')}"