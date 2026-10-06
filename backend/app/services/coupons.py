from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status

from app.models.coupon import Coupon


def calculate_coupon_discount(
    coupon: Coupon,
    order_amount: Decimal,
    *,
    validate_usage_limit: bool = True,
) -> tuple[Decimal, Decimal]:
    if not coupon.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon is inactive")

    now = datetime.now(timezone.utc)
    if coupon.start_date and now < coupon.start_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon is not active yet")

    if coupon.end_date and now > coupon.end_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon has expired")

    if (
        validate_usage_limit
        and coupon.usage_limit is not None
        and coupon.used_count >= coupon.usage_limit
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon usage limit reached")

    if coupon.minimum_order_amount is not None and order_amount < coupon.minimum_order_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum order amount is {coupon.minimum_order_amount}",
        )

    if coupon.discount_type == "percentage":
        discount_amount = order_amount * coupon.discount_value / Decimal("100")
    elif coupon.discount_type == "fixed":
        discount_amount = coupon.discount_value
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid discount type")

    if coupon.maximum_discount_amount is not None:
        discount_amount = min(discount_amount, coupon.maximum_discount_amount)

    discount_amount = min(discount_amount, order_amount).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )
    final_amount = (order_amount - discount_amount).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )
    return discount_amount, final_amount