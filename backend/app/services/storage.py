from urllib.parse import quote

import boto3
from botocore.config import Config

from app.core.config import settings


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
    public_base_url = settings.S3_PUBLIC_BASE_URL or (
        f"{settings.S3_ENDPOINT_URL.rstrip('/')}/{settings.S3_BUCKET_NAME}"
    )
    return client, settings.S3_BUCKET_NAME, public_base_url.rstrip("/")


def get_image_url(public_base_url: str, object_key: str) -> str:
    return f"{public_base_url}/{quote(object_key, safe='/')}"