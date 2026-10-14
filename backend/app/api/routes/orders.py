from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field

from app.core.security import get_current_admin
from app.db.dependencies import get_db
from app.models.coupon import Coupon
from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.schemas.order import (
    OrderCreate,
    OrderItemsUpdate,
    OrderResponse,
    OrderUpdateStatus,
)
from app.services.coupons import calculate_coupon_discount
from app.services.order_email import (
    notify_order_placed,
    notify_order_status_updated,
)


router = APIRouter(
    prefix="/api/orders",
    tags=["orders"],
)


def _get_unit_price(product: Product, variant: ProductVariant | None) -> Decimal:
    if variant is None or variant.price is None:
        return product.price

    unit_price = variant.price
    if product.discount_type == "percentage" and product.discount_percentage is not None:
        unit_price = (
            unit_price
            * (Decimal("100") - product.discount_percentage)
            / Decimal("100")
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return unit_price


class OrderTrackRequest(BaseModel):
    order_number: str = Field(min_length=1, max_length=40)
    phone: str = Field(min_length=10, max_length=15)


async def _build_items(payload_items, db: AsyncSession) -> tuple[list[OrderItem], Decimal]:
    order_items = []
    subtotal = Decimal("0.00")

    for payload_item in payload_items:
        product_result = await db.execute(
            select(Product).where(
                Product.id == payload_item.product_id,
                Product.is_active.is_(True),
            )
        )
        product = product_result.scalar_one_or_none()
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found or inactive",
            )

        variant = None
        if payload_item.product_variant_id is not None:
            variant = await db.get(ProductVariant, payload_item.product_variant_id)
            if (
                variant is None
                or variant.product_id != product.id
                or not variant.is_active
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product variant does not belong to this product or is inactive",
                )

        unit_price = _get_unit_price(product, variant)
        item_subtotal = unit_price * payload_item.quantity
        subtotal += item_subtotal
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_variant_id=variant.id if variant else None,
                product_name=product.name,
                product_sku=variant.sku if variant else None,
                unit_price=unit_price,
                quantity=payload_item.quantity,
                subtotal=item_subtotal,
            )
        )

    return order_items, subtotal


async def _get_order(order_id: UUID, db: AsyncSession) -> Order:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return order


async def _get_coupon(code: str | None, db: AsyncSession) -> Coupon | None:
    if not code:
        return None
    result = await db.execute(
        select(Coupon).where(func.lower(Coupon.code) == code.lower())
    )
    coupon = result.scalar_one_or_none()
    if coupon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found",
        )
    return coupon


@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
):
    items, subtotal = await _build_items(payload.items, db)
    shipping_fee = Decimal("0.00")
    total_amount = subtotal + shipping_fee
    coupon = await _get_coupon(payload.coupon_code, db)
    discount_amount = Decimal("0.00")
    final_amount = total_amount
    if coupon is not None:
        discount_amount, final_amount = calculate_coupon_discount(
            coupon,
            total_amount,
        )
        coupon.used_count += 1

    order = Order(
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_email=payload.customer_email,
        shipping_address_line1=payload.shipping_address_line1,
        shipping_address_line2=payload.shipping_address_line2,
        shipping_city=payload.shipping_city,
        shipping_state=payload.shipping_state,
        shipping_postal_code=payload.shipping_postal_code,
        shipping_country=payload.shipping_country,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        discount_amount=discount_amount,
        total_amount=total_amount,
        final_amount=final_amount,
        coupon_code=coupon.code if coupon else None,
        notes=payload.notes,
        status=OrderStatus.PLACED,
        items=items,
    )
    db.add(order)
    await db.commit()
    order = await _get_order(order.id, db)
    await notify_order_placed(order)
    return order


@router.post("/track")
async def track_order(
    payload: OrderTrackRequest,
    db: AsyncSession = Depends(get_db),
):
    order_number = payload.order_number.strip().upper()
    phone = payload.phone.strip()

    if not order_number or not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order reference and phone number are required",
        )

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(
            func.upper(Order.order_number) == order_number,
            Order.customer_phone == phone,
        )
    )

    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="We couldn't verify these order details.",
        )

    # Return only tracking information, not the customer's
    # address, email, or phone number.
    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status.value,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": [
            {
                "id": str(item.id),
                "product_id": str(item.product_id) if item.product_id else None,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in order.items
        ],
        "subtotal": order.subtotal,
        "shipping_fee": order.shipping_fee,
        "discount_amount": order.discount_amount,
        "total_amount": order.total_amount,
        "final_amount": order.final_amount,
    }


@router.get("/reference/{order_number}")
async def get_order_by_reference(
    order_number: str,
    db: AsyncSession = Depends(get_db),
):
    reference = order_number.strip().upper()

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(func.upper(func.trim(Order.order_number)) == reference)
    )
    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )


    # Return tracking details without exposing customer contact information.
    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status.value,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": [
            {
                "id": str(item.id),
                "product_id": str(item.product_id) if item.product_id else None,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in order.items
        ],
        "subtotal": order.subtotal,
        "shipping_fee": order.shipping_fee,
        "discount_amount": order.discount_amount,
        "total_amount": order.total_amount,
        "final_amount": order.final_amount,
    }



@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await _get_order(order_id, db)


@router.get("/", response_model=list[OrderResponse])
async def list_orders(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/phone/{phone}", response_model=list[OrderResponse])
async def get_orders_by_phone(
    phone: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.customer_phone == phone)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/{order_id}/items", response_model=OrderResponse)
async def update_order_items(
    order_id: UUID,
    payload: OrderItemsUpdate,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    order = await _get_order(order_id, db)
    items, subtotal = await _build_items(payload.items, db)
    total_amount = subtotal + order.shipping_fee
    discount_amount = Decimal("0.00")
    final_amount = total_amount

    coupon = await _get_coupon(order.coupon_code, db)
    if coupon is not None:
        discount_amount, final_amount = calculate_coupon_discount(
            coupon,
            total_amount,
            validate_usage_limit=False,
        )

    order.items = items
    order.subtotal = subtotal
    order.discount_amount = discount_amount
    order.total_amount = total_amount
    order.final_amount = final_amount
    await db.commit()
    return await _get_order(order_id, db)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: UUID,
    payload: OrderUpdateStatus,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    order = await _get_order(order_id, db)
    previous_status = order.status
    workflow = [
        OrderStatus.PLACED,
        OrderStatus.UNDER_REVIEW,
        OrderStatus.CONFIRMED,
        OrderStatus.SHIPPED,
    ]
    current_index = workflow.index(order.status)
    if current_index == len(workflow) - 1 or payload.status != workflow[current_index + 1]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order status must advance one step at a time",
        )

    order.status = payload.status
    await db.commit()
    order = await _get_order(order_id, db)
    if previous_status != order.status:
        await notify_order_status_updated(order, previous_status)
    return order