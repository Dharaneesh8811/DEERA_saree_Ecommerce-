from __future__ import annotations

import logging
from uuid import UUID, uuid4

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.core.security import get_current_admin
from app.db.dependencies import get_db
from app.models.category import Category
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from app.services.storage import get_image_url, get_storage_client


router = APIRouter(
    prefix="/api/categories",
    tags=["categories"],
)

logger = logging.getLogger(__name__)

IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024


# ---------------------------------------------------------
# CREATE CATEGORY
# ---------------------------------------------------------

@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    category = Category(
        name=payload.name,
        product_type=payload.product_type,
        saree=payload.saree,
        description=payload.description,
        image_url=payload.image_url,
        is_active=payload.is_active,
    )

    db.add(category)

    await db.commit()
    await db.refresh(category)

    return category


# ---------------------------------------------------------
# UPLOAD CATEGORY IMAGE
# ---------------------------------------------------------

@router.post(
    "/upload/{category_id}",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_category_image(
    category_id: UUID,
    image: UploadFile,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    category = await db.get(
        Category,
        category_id,
    )

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    extension = IMAGE_TYPES.get(
        image.content_type or ""
    )

    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Only JPEG, PNG, WebP, and AVIF images "
                "are supported"
            ),
        )

    # Check file size
    image.file.seek(0, 2)
    file_size = image.file.tell()
    image.file.seek(0)

    if file_size == 0 or file_size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must be between 1 byte and 10 MB",
        )

    # Get RustFS/S3 client
    try:
        client, bucket, public_base_url = get_storage_client()

    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error

    # Store category image
    object_key = (
        f"categories/{category_id}/{uuid4()}.{extension}"
    )

    try:
        await run_in_threadpool(
            client.upload_fileobj,
            image.file,
            bucket,
            object_key,
            ExtraArgs={
                "ContentType": image.content_type,
            },
        )

    except (BotoCoreError, ClientError) as error:
        storage_error = (
            error.response.get("Error", {}).get("Code", "unknown")
            if isinstance(error, ClientError)
            else type(error).__name__
        )
        logger.warning("Category image upload failed in storage: %s", storage_error)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Image upload failed in storage ({storage_error})",
        ) from error

    new_image_url = get_image_url(
        public_base_url,
        object_key,
    )

    old_image_url = category.image_url

    category.image_url = new_image_url

    try:
        await db.commit()

    except Exception:
        await db.rollback()

        try:
            await run_in_threadpool(
                client.delete_object,
                Bucket=bucket,
                Key=object_key,
            )
        except Exception:
            pass

        raise

    await db.refresh(category)

    # Delete previous category image from RustFS
    if (
        old_image_url
        and old_image_url != new_image_url
    ):
        old_prefix = f"{public_base_url}/"

        if old_image_url.startswith(old_prefix):
            old_key = old_image_url[
                len(old_prefix):
            ]

            try:
                await run_in_threadpool(
                    client.delete_object,
                    Bucket=bucket,
                    Key=old_key,
                )
            except Exception:
                pass

    return category


# ---------------------------------------------------------
# GET ALL CATEGORIES
# ---------------------------------------------------------

@router.get(
    "",
    response_model=list[CategoryResponse],
)
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Category).order_by(
            Category.created_at.desc()
        )
    )

    categories = result.scalars().all()

    return categories


# ---------------------------------------------------------
# GET SINGLE CATEGORY
# ---------------------------------------------------------

@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
)
async def get_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Category).where(
            Category.id == category_id
        )
    )

    category = result.scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


# ---------------------------------------------------------
# UPDATE CATEGORY
# ---------------------------------------------------------

@router.patch(
    "/{category_id}",
    response_model=CategoryResponse,
)
async def update_category(
    category_id: UUID,
    payload: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(Category).where(
            Category.id == category_id
        )
    )

    category = result.scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            category,
            field,
            value,
        )

    await db.commit()
    await db.refresh(category)

    return category


# ---------------------------------------------------------
# DELETE CATEGORY
# ---------------------------------------------------------

@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(Category).where(
            Category.id == category_id
        )
    )

    category = result.scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    category.is_active = False
    await db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )