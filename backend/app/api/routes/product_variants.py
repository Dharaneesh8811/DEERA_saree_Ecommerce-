from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db
from app.core.security import get_current_admin
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.schemas.product_variant import (
    ProductVariantCreate,
    ProductVariantResponse,
    ProductVariantUpdate,
)

router = APIRouter(prefix="/api/product-variants", tags=["product-variants"])


@router.post("", response_model=ProductVariantResponse, status_code=status.HTTP_201_CREATED)
async def create_product_variant(
    payload: ProductVariantCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    product_result = await db.execute(
        select(Product).where(Product.id == payload.product_id)
    )
    product = product_result.scalar_one_or_none()

    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    variant = ProductVariant(
        product_id=payload.product_id,
        name=payload.name,
        sku=payload.sku,
        price=payload.price,
        stock_quantity=payload.stock_quantity,
        is_active=payload.is_active,
    )

    db.add(variant)
    await db.commit()
    await db.refresh(variant)

    return variant


@router.get("", response_model=list[ProductVariantResponse])
async def list_product_variants(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProductVariant).order_by(ProductVariant.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{variant_id}", response_model=ProductVariantResponse)
async def get_product_variant(
    variant_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProductVariant).where(ProductVariant.id == variant_id)
    )
    variant = result.scalar_one_or_none()

    if variant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product variant not found",
        )

    return variant


@router.patch("/{variant_id}", response_model=ProductVariantResponse)
async def update_product_variant(
    variant_id: UUID,
    payload: ProductVariantUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(ProductVariant).where(ProductVariant.id == variant_id)
    )
    variant = result.scalar_one_or_none()

    if variant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product variant not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(variant, field, value)

    await db.commit()
    await db.refresh(variant)

    return variant


@router.delete("/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_variant(
    variant_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(ProductVariant).where(ProductVariant.id == variant_id)
    )
    variant = result.scalar_one_or_none()

    if variant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product variant not found",
        )

    await db.delete(variant)
    await db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)