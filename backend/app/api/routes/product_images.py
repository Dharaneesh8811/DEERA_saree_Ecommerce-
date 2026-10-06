import logging
from urllib.parse import unquote
from uuid import UUID, uuid4

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.security import get_current_admin
from app.core.config import settings
from app.db.dependencies import get_db
from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.product_image import (
    ProductImageCreate,
    ProductImageResponse,
    ProductImageUpdate,
)
from app.services.storage import get_image_url, get_storage_client

router = APIRouter(
    prefix="/api/product-images",
    tags=["product-images"],
)

logger = logging.getLogger(__name__)

IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
}
MAX_IMAGE_SIZE = 10 * 1024 * 1024


@router.post(
    "/upload/{product_id}",
    response_model=ProductImageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_product_image(
    product_id: UUID,
    image: UploadFile,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    product = await db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    extension = IMAGE_TYPES.get(image.content_type or "")
    if extension is None:
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

    try:
        client, bucket, public_base_url = get_storage_client()
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

    object_key = f"products/{product_id}/{uuid4()}.{extension}"
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
        logger.warning("Product image upload failed in storage: %s", storage_error)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Image upload failed in storage ({storage_error})",
        ) from error

    image_record = ProductImage(
        product_id=product_id,
        image_url=get_image_url(public_base_url, object_key),
        alt_text=image.filename,
    )
    db.add(image_record)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        await run_in_threadpool(client.delete_object, Bucket=bucket, Key=object_key)
        raise

    await db.refresh(image_record)
    return image_record


@router.post(
    "/",
    response_model=ProductImageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_product_image(
    image_data: ProductImageCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    product = await db.get(Product, image_data.product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    image = ProductImage(
        product_id=image_data.product_id,
        image_url=image_data.image_url,
        alt_text=image_data.alt_text,
        display_order=image_data.display_order,
        is_primary=image_data.is_primary,
    )

    db.add(image)
    await db.commit()
    await db.refresh(image)

    return image


@router.get(
    "/product/{product_id}",
    response_model=list[ProductImageResponse],
)
async def get_product_images(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    result = await db.execute(
        select(ProductImage)
        .where(ProductImage.product_id == product_id)
        .order_by(ProductImage.display_order)
    )

    return result.scalars().all()


@router.get(
    "/{image_id}",
    response_model=ProductImageResponse,
)
async def get_product_image(
    image_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    image = await db.get(ProductImage, image_id)

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product image not found",
        )

    return image


@router.patch(
    "/{image_id}",
    response_model=ProductImageResponse,
)
async def update_product_image(
    image_id: UUID,
    image_data: ProductImageUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    image = await db.get(ProductImage, image_id)

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product image not found",
        )

    update_data = image_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(image, field, value)

    await db.commit()
    await db.refresh(image)

    return image


@router.delete(
    "/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_product_image(
    image_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    image = await db.get(ProductImage, image_id)

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product image not found",
        )

    public_base_url = settings.S3_PUBLIC_BASE_URL
    if (
        not public_base_url
        and settings.S3_ENDPOINT_URL
        and settings.S3_BUCKET_NAME
    ):
        public_base_url = (
            f"{settings.S3_ENDPOINT_URL.rstrip('/')}/"
            f"{settings.S3_BUCKET_NAME}"
        )

    if public_base_url:
        storage_prefix = f"{public_base_url.rstrip('/')}/"
        if image.image_url.startswith(storage_prefix):
            try:
                client, bucket, configured_base_url = get_storage_client()
            except RuntimeError as error:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Image storage is not configured",
                ) from error

            object_key = unquote(
                image.image_url[len(f"{configured_base_url}/"):]
            )
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
                logger.warning(
                    "Product image deletion failed in storage: %s",
                    storage_error,
                )
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Image deletion failed in storage ({storage_error})",
                ) from error

    await db.delete(image)
    await db.commit()