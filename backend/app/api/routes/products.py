from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
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


def _apply_discount(
    *,
    price: Decimal,
    mrp: Decimal | None,
    discount_type: str | None,
    discount_value: Decimal | None,
    existing_price: Decimal | None = None,
    existing_mrp: Decimal | None = None,
) -> tuple[Decimal, Decimal | None, Decimal | None]:
    if discount_type is None:
        if mrp is not None and mrp < price:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="MRP must be greater than or equal to the selling price.",
            )
        return price, mrp, None

    if discount_type == "none":
        if existing_price is not None and existing_mrp is not None and existing_mrp > existing_price:
            return existing_mrp, None, None
        return price, mrp, None

    if discount_value is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="A discount value is required.",
        )

    original_price = mrp if mrp is not None else price
    if original_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="The original price must be greater than zero.",
        )

    if discount_type == "percentage":
        if discount_value >= Decimal("100"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Discount percentage must be less than 100.",
            )
        sale_price = (original_price * (Decimal("100") - discount_value) / Decimal("100")).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )
        stored_percentage = discount_value
    else:
        sale_price = discount_value
        stored_percentage = None

    if sale_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="The discounted price must be greater than zero.",
        )
    if sale_price > original_price:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="The discounted price cannot exceed the original price.",
        )

    return sale_price, original_price, stored_percentage


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
    discount_type = payload.discount_type
    discount_value = payload.discount_value
    if discount_type is None and payload.discount_percentage is not None:
        discount_type = "percentage"
        discount_value = payload.discount_percentage

    price, mrp, discount_percentage = _apply_discount(
        price=payload.price,
        mrp=payload.mrp,
        discount_type=discount_type,
        discount_value=discount_value,
    )

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
        price=price,
        mrp=mrp,
        discount_percentage=(
            discount_percentage
            if discount_type is not None
            else payload.discount_percentage
        ),
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
        exclude_unset=True,
    )
    discount_type = update_data.pop("discount_type", None)
    discount_value = update_data.pop("discount_value", None)
    legacy_discount_percentage = update_data.pop("discount_percentage", None)
    if discount_type is None and legacy_discount_percentage is not None:
        discount_type = "percentage"
        discount_value = legacy_discount_percentage
    elif (
        discount_type == "percentage"
        and discount_value is None
        and legacy_discount_percentage is not None
    ):
        discount_value = legacy_discount_percentage

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

    if discount_type is not None:
        price, mrp, discount_percentage = _apply_discount(
            price=update_data.get("price", product.price),
            mrp=update_data.get("mrp", product.mrp),
            discount_type=discount_type,
            discount_value=discount_value,
            existing_price=product.price,
            existing_mrp=product.mrp,
        )
        update_data["price"] = price
        update_data["mrp"] = mrp
        update_data["discount_percentage"] = discount_percentage
    elif "price" in update_data or "mrp" in update_data:
        price, mrp, _ = _apply_discount(
            price=update_data.get("price", product.price),
            mrp=update_data.get("mrp", product.mrp),
            discount_type=None,
            discount_value=None,
        )
        update_data["price"] = price
        update_data["mrp"] = mrp

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