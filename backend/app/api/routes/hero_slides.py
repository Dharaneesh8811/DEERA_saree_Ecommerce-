import logging
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_admin
from app.db.dependencies import get_db
from app.models.hero import Hero
from app.schemas.hero import (
    HeroResponse,
    HeroSlideFields,
    HeroSlideReorder,
    HeroSlideStatusUpdate,
)
from app.services.hero_images import (
    cleanup_uploaded_hero_image,
    delete_hero_image,
    upload_hero_image,
)


router = APIRouter(prefix="/api/hero-slides", tags=["hero-slides"])
logger = logging.getLogger(__name__)
MAX_ACTIVE_SLIDES = 4


def _validate_slide_fields(
    heading: str,
    description: str,
    cta_text: str,
    cta_url: str,
) -> HeroSlideFields:
    try:
        return HeroSlideFields.model_validate(
            {
                "heading": heading,
                "description": description,
                "cta_text": cta_text,
                "cta_url": cta_url,
            }
        )
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=error.errors(include_context=False),
        ) from error


async def _ensure_active_capacity(
    db: AsyncSession,
    is_active: bool,
    exclude_id: UUID | None = None,
) -> None:
    if not is_active:
        return

    query = select(func.count()).select_from(Hero).where(Hero.is_active.is_(True))
    if exclude_id is not None:
        query = query.where(Hero.id != exclude_id)
    active_count = await db.scalar(query)
    if active_count is not None and active_count >= MAX_ACTIVE_SLIDES:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A maximum of four hero slides can be active at once.",
        )


async def _ensure_minimum_active_slides(
    db: AsyncSession,
    slide: Hero,
    is_active: bool,
) -> None:
    if is_active or not slide.is_active:
        return

    active_count = await db.scalar(
        select(func.count()).select_from(Hero).where(Hero.is_active.is_(True))
    )
    if active_count is not None and active_count <= 3:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="At least three hero slides must stay active. Activate a replacement first.",
        )


@router.get("/active", response_model=list[HeroResponse])
async def get_active_hero_slides(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Hero)
        .where(Hero.is_active.is_(True))
        .order_by(Hero.display_order, Hero.created_at, Hero.id)
    )
    return result.scalars().all()


@router.get(
    "/",
    response_model=list[HeroResponse],
    dependencies=[Depends(get_current_admin)],
)
async def list_hero_slides(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Hero).order_by(Hero.display_order, Hero.created_at, Hero.id)
    )
    return result.scalars().all()


@router.post(
    "/",
    response_model=HeroResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_hero_slide(
    heading: str = Form(..., min_length=1, max_length=160),
    description: str = Form(..., min_length=1, max_length=2000),
    cta_text: str = Form(..., min_length=1, max_length=60),
    cta_url: str = Form(..., min_length=1, max_length=2048),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    fields = _validate_slide_fields(heading, description, cta_text, cta_url)
    await _ensure_active_capacity(db, is_active)
    image_url, object_key = await upload_hero_image(image)
    current_order = await db.scalar(select(func.max(Hero.display_order)))
    slide = Hero(
        **fields.model_dump(),
        image_url=image_url,
        display_order=(current_order if current_order is not None else -1) + 1,
        is_active=is_active,
    )
    db.add(slide)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        await cleanup_uploaded_hero_image(object_key)
        raise
    await db.refresh(slide)
    return slide


@router.put("/reorder", response_model=list[HeroResponse])
async def reorder_hero_slides(
    reorder: HeroSlideReorder,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(select(Hero).order_by(Hero.display_order, Hero.id))
    slides = result.scalars().all()
    existing_ids = {slide.id for slide in slides}
    requested_ids = reorder.slide_ids
    if len(requested_ids) != len(set(requested_ids)) or set(requested_ids) != existing_ids:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="The order must contain every hero slide exactly once.",
        )

    slides_by_id = {slide.id: slide for slide in slides}
    ordered_slides = [slides_by_id[slide_id] for slide_id in requested_ids]
    for position, slide in enumerate(ordered_slides):
        slide.display_order = position
    await db.commit()
    for slide in ordered_slides:
        await db.refresh(slide)
    return ordered_slides


@router.patch("/{slide_id}/status", response_model=HeroResponse)
async def update_hero_slide_status(
    slide_id: UUID,
    update: HeroSlideStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    slide = await db.get(Hero, slide_id)
    if slide is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero slide not found",
        )
    await _ensure_active_capacity(db, update.is_active, exclude_id=slide.id)
    await _ensure_minimum_active_slides(db, slide, update.is_active)
    slide.is_active = update.is_active
    await db.commit()
    await db.refresh(slide)
    return slide


@router.put("/{slide_id}", response_model=HeroResponse)
async def update_hero_slide(
    slide_id: UUID,
    heading: str = Form(..., min_length=1, max_length=160),
    description: str = Form(..., min_length=1, max_length=2000),
    cta_text: str = Form(..., min_length=1, max_length=60),
    cta_url: str = Form(..., min_length=1, max_length=2048),
    is_active: bool = Form(...),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    slide = await db.get(Hero, slide_id)
    if slide is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero slide not found",
        )

    fields = _validate_slide_fields(heading, description, cta_text, cta_url)
    await _ensure_active_capacity(db, is_active, exclude_id=slide.id)
    await _ensure_minimum_active_slides(db, slide, is_active)

    old_image_url = slide.image_url
    object_key = None
    if image is not None:
        new_image_url, object_key = await upload_hero_image(image)
        slide.image_url = new_image_url
    for name, value in fields.model_dump().items():
        setattr(slide, name, value)
    slide.is_active = is_active

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        if object_key is not None:
            await cleanup_uploaded_hero_image(object_key)
        raise

    if object_key is not None:
        try:
            await delete_hero_image(old_image_url)
        except HTTPException as error:
            logger.warning(
                "Updated hero slide %s but old image cleanup failed: %s",
                slide_id,
                error.detail,
            )
    await db.refresh(slide)
    return slide


@router.delete("/{slide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hero_slide(
    slide_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    slide = await db.get(Hero, slide_id)
    if slide is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero slide not found",
        )

    await _ensure_minimum_active_slides(db, slide, False)
    await delete_hero_image(slide.image_url)
    await db.delete(slide)
    await db.commit()
