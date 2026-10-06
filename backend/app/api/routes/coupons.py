from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db
from app.core.security import get_current_admin
from app.models.coupon import Coupon
from app.services.coupons import calculate_coupon_discount
from app.schemas.coupon import (
    CouponApplyRequest,
    CouponApplyResponse,
    CouponCreate,
    CouponResponse,
    CouponUpdate,
)

router = APIRouter(
    prefix="/api/coupons",
    tags=["coupons"],
)


# ---------------------------------------------------------
# CREATE COUPON
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=CouponResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_coupon(
    coupon_data: CouponCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    existing_coupon = await db.execute(
        select(Coupon).where(
            Coupon.code == coupon_data.code
        )
    )

    if existing_coupon.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Coupon code already exists",
        )

    coupon = Coupon(
        code=coupon_data.code,
        discount_type=coupon_data.discount_type,
        discount_value=coupon_data.discount_value,
        minimum_order_amount=coupon_data.minimum_order_amount,
        maximum_discount_amount=coupon_data.maximum_discount_amount,
        start_date=coupon_data.start_date,
        end_date=coupon_data.end_date,
        usage_limit=coupon_data.usage_limit,
        is_active=coupon_data.is_active,
    )

    db.add(coupon)

    await db.commit()
    await db.refresh(coupon)

    return coupon


# ---------------------------------------------------------
# GET ALL COUPONS
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[CouponResponse],
)
async def get_coupons(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    result = await db.execute(
        select(Coupon).order_by(
            Coupon.created_at.desc()
        )
    )

    return result.scalars().all()


# ---------------------------------------------------------
# APPLY / VALIDATE COUPON
# ---------------------------------------------------------

@router.post(
    "/apply",
    response_model=CouponApplyResponse,
)
async def apply_coupon(
    coupon_data: CouponApplyRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Coupon).where(
            Coupon.code == coupon_data.code
        )
    )

    coupon = result.scalar_one_or_none()

    # Coupon does not exist
    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Coupon not found",
        )

    discount_amount, final_amount = calculate_coupon_discount(
        coupon,
        coupon_data.order_amount,
    )

    return CouponApplyResponse(
        code=coupon.code,
        discount_type=coupon.discount_type,
        order_amount=coupon_data.order_amount,
        discount_amount=discount_amount,
        final_amount=final_amount,
    )


# ---------------------------------------------------------
# GET SINGLE COUPON
# ---------------------------------------------------------

@router.get(
    "/{coupon_id}",
    response_model=CouponResponse,
)
async def get_coupon(
    coupon_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    coupon = await db.get(
        Coupon,
        coupon_id,
    )

    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Coupon not found",
        )

    return coupon


# ---------------------------------------------------------
# UPDATE COUPON
# ---------------------------------------------------------

@router.patch(
    "/{coupon_id}",
    response_model=CouponResponse,
)
async def update_coupon(
    coupon_id: UUID,
    coupon_data: CouponUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    coupon = await db.get(
        Coupon,
        coupon_id,
    )

    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Coupon not found",
        )

    update_data = coupon_data.model_dump(
        exclude_unset=True
    )

    # Check duplicate coupon code
    if "code" in update_data:

        existing_coupon = await db.execute(
            select(Coupon).where(
                Coupon.code == update_data["code"],
                Coupon.id != coupon_id,
            )
        )

        if existing_coupon.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Coupon code already exists",
            )

    # Apply updates
    for field, value in update_data.items():
        setattr(
            coupon,
            field,
            value,
        )

    await db.commit()
    await db.refresh(coupon)

    return coupon


# ---------------------------------------------------------
# DELETE COUPON
# ---------------------------------------------------------

@router.delete(
    "/{coupon_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_coupon(
    coupon_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    coupon = await db.get(
        Coupon,
        coupon_id,
    )

    if not coupon:
        raise HTTPException(
            status_code=404,
            detail="Coupon not found",
        )

    await db.delete(coupon)
    await db.commit()