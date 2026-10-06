from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db
from app.core.security import get_current_admin
from app.models.category import Category
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate


router = APIRouter(
    prefix="/api/products",
    tags=["products"],
)


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_product(
    payload: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    category_result = await db.execute(
        select(Category).where(
            Category.id == payload.category_id
        )
    )

    category = category_result.scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    product = Product(
        name=payload.name,
        description=payload.description,
        category_id=payload.category_id,
        price=payload.price,
        mrp=payload.mrp,
        discount_percentage=payload.discount_percentage,
        color=payload.color,
        occasion=payload.occasion,
        fabric_weight=payload.fabric_weight,
        border_style=payload.border_style,
        fabric=payload.fabric,
        weave=payload.weave,
        zari=payload.zari,
        blouse_included=payload.blouse_included,
        saree_length=payload.saree_length,
        gi_certified=payload.gi_certified,
        silk_mark_certified=payload.silk_mark_certified,
        is_active=payload.is_active,
        is_new_arrival=payload.is_new_arrival,
        is_best_seller=payload.is_best_seller,
        is_editor_pick=payload.is_editor_pick,
    )

    db.add(product)

    await db.commit()
    await db.refresh(product)

    return product


@router.get(
    "/",
    response_model=list[ProductResponse],
)
async def list_products(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).order_by(
            Product.created_at.desc()
        )
    )

    products = result.scalars().all()

    return products


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id
        )
    )

    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
)
async def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id
        )
    )

    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if (
        "category_id" in update_data
        and update_data["category_id"] is not None
    ):
        category_result = await db.execute(
            select(Category).where(
                Category.id == update_data["category_id"]
            )
        )

        category = category_result.scalar_one_or_none()

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)

    return product


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(Product).where(
            Product.id == product_id
        )
    )

    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Soft delete instead of permanently deleting
    product.is_active = False

    await db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )