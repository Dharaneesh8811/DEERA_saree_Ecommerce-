from __future__ import annotations

import logging

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_admin
from app.db.dependencies import get_db
from app.models.hero import Hero
from app.schemas.hero import HeroContentUpdate, HeroResponse
from app.services.hero_images import (
    cleanup_uploaded_hero_image,
    delete_hero_image,
    upload_hero_image,
)


router = APIRouter(
    prefix="/api/hero",
    tags=["hero"],
)
logger = logging.getLogger(__name__)


@router.get(
    "/",
    response_model=HeroResponse | None,
)
async def get_hero(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Hero)
        .where(Hero.is_active.is_(True))
        .order_by(Hero.display_order, Hero.created_at, Hero.id)
    )

    hero = result.scalars().first()

    return hero


@router.put(
    "/",
    response_model=HeroResponse,
)
async def update_hero(
    heading: str = Form(..., min_length=1, max_length=160),
    description: str = Form(..., min_length=1, max_length=2000),
    image: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    try:
        content = HeroContentUpdate(
            heading=heading,
            description=description,
        )
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=error.errors(include_context=False),
        ) from error

    result = await db.execute(
        select(Hero).order_by(
            Hero.is_active.desc(),
            Hero.display_order,
            Hero.created_at,
            Hero.id,
        )
    )
    heroes = result.scalars().all()
    hero = heroes[0] if heroes else None

    if hero is None and image is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Upload an image before creating the first hero.",
        )

    image_url = None
    object_key = None
    if image is not None:
        image_url, object_key = await upload_hero_image(image)

    old_image_url = hero.image_url if hero is not None else None
    if hero is None:
        if image_url is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Upload an image before creating the first hero.",
            )
        last_order = await db.scalar(select(func.max(Hero.display_order)))
        hero = Hero(
            heading=content.heading,
            description=content.description,
            image_url=image_url,
            display_order=(last_order if last_order is not None else -1) + 1,
            is_active=True,
        )
        db.add(hero)
    else:
        hero.heading = content.heading
        hero.description = content.description
        hero.is_active = True
        if image_url is not None:
            hero.image_url = image_url

    for other_hero in heroes:
        if other_hero.id != hero.id and other_hero.is_active:
            other_hero.is_active = False

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        if object_key is not None:
            await cleanup_uploaded_hero_image(object_key)
        raise

    if object_key is not None and old_image_url:
        try:
            await delete_hero_image(old_image_url)
        except HTTPException as error:
            logger.warning(
                "Updated hero %s but old image cleanup failed: %s",
                hero.id,
                error.detail,
            )

    await db.refresh(hero)
    return hero


@router.post(
    "/upload",
    response_model=HeroResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_hero(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    image_url, object_key = await upload_hero_image(file)
    result = await db.execute(
        select(Hero)
        .where(Hero.is_active.is_(True))
        .order_by(Hero.display_order, Hero.created_at, Hero.id)
    )
    hero = result.scalars().first()
    old_image_url = hero.image_url if hero is not None else None

    if hero is None:
        last_order = await db.scalar(select(func.max(Hero.display_order)))
        hero = Hero(
            image_url=image_url,
            display_order=(last_order if last_order is not None else -1) + 1,
            is_active=True,
        )
        db.add(hero)
    else:
        hero.image_url = image_url

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        await cleanup_uploaded_hero_image(object_key)
        raise

    if old_image_url:
        try:
            await delete_hero_image(old_image_url)
        except HTTPException as error:
            logger.warning("Legacy hero image cleanup failed: %s", error.detail)
    await db.refresh(hero)

    return hero