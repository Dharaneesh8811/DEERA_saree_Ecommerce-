import logging
from urllib.parse import unquote
from uuid import uuid4

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool

from app.services.storage import get_image_url, get_public_base_url, get_storage_client


logger = logging.getLogger(__name__)
IMAGE_TYPES = {
    "image/jpeg": ("jpg", lambda data: data.startswith(b"\xff\xd8\xff")),
    "image/png": ("png", lambda data: data.startswith(b"\x89PNG\r\n\x1a\n")),
    "image/webp": (
        "webp",
        lambda data: data.startswith(b"RIFF") and data[8:12] == b"WEBP",
    ),
    "image/avif": (
        "avif",
        lambda data: len(data) >= 12
        and data[4:8] == b"ftyp"
        and data[8:12] in {b"avif", b"avis"},
    ),
}
MAX_IMAGE_SIZE = 10 * 1024 * 1024


async def upload_hero_image(image: UploadFile) -> tuple[str, str]:
    image_type = IMAGE_TYPES.get(image.content_type or "")
    if image_type is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, WebP, and AVIF images are supported",
        )

    image.file.seek(0, 2)
    file_size = image.file.tell()
    image.file.seek(0)
    if file_size == 0 or file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must be between 1 byte and 10 MB",
        )

    signature = image.file.read(16)
    image.file.seek(0)
    extension, signature_check = image_type
    if not signature_check(signature):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="The uploaded file does not match its declared image type",
        )

    try:
        client, bucket, public_base_url = get_storage_client()
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

    if not public_base_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Public image storage URL is not configured",
        )

    object_key = f"hero/{uuid4()}.{extension}"
    try:
        await run_in_threadpool(
            client.upload_fileobj,
            image.file,
            bucket,
            object_key,
            ExtraArgs={"ContentType": image.content_type},
        )
    except (BotoCoreError, ClientError) as error:
        storage_error = (
            error.response.get("Error", {}).get("Code", "unknown")
            if isinstance(error, ClientError)
            else type(error).__name__
        )
        logger.exception(
            "Hero image upload failed in configured S3 storage (error_code=%s)",
            storage_error,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Image storage could not save the hero image. "
                "Please check storage configuration or contact support."
            ),
        ) from error

    return get_image_url(public_base_url, object_key), object_key


async def delete_hero_image(image_url: str) -> None:
    public_base_url = get_public_base_url()
    if not public_base_url or not image_url.startswith(f"{public_base_url}/"):
        return

    object_key = unquote(image_url[len(public_base_url) + 1 :])
    if not object_key.startswith("hero/"):
        return

    try:
        client, bucket, _ = get_storage_client()
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image storage is not configured",
        ) from error

    try:
        await run_in_threadpool(
            client.delete_object,
            Bucket=bucket,
            Key=object_key,
        )
    except (BotoCoreError, ClientError) as error:
        storage_error = (
            error.response.get("Error", {}).get("Code", "unknown")
            if isinstance(error, ClientError)
            else type(error).__name__
        )
        logger.warning("Hero image deletion failed in storage: %s", storage_error)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Image deletion failed in storage ({storage_error})",
        ) from error


async def cleanup_uploaded_hero_image(object_key: str) -> None:
    try:
        client, bucket, _ = get_storage_client()
        await run_in_threadpool(
            client.delete_object,
            Bucket=bucket,
            Key=object_key,
        )
    except (BotoCoreError, ClientError, RuntimeError) as error:
        logger.warning(
            "Could not clean up uploaded hero image %s: %s",
            object_key,
            type(error).__name__,
        )
