from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import create_access_token, get_current_admin, verify_password
from app.db.dependencies import get_db
from app.models.admin import Admin
from app.models.bulk_order import BulkOrder
from app.models.order import Order
from app.schemas.admin import AdminLogin, AdminResponse, AdminTokenResponse
from app.schemas.bulk_order import BulkOrderResponse, BulkOrderUpdate
from app.schemas.order import OrderResponse


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/auth/login", response_model=AdminTokenResponse)
async def login(
    payload: AdminLogin,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Admin).where(func.lower(Admin.email) == payload.email.lower())
    )

    admin = result.scalar_one_or_none()

    if admin is None or not admin.is_active or not verify_password(
        payload.password,
        admin.password_hash if admin else "",
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AdminTokenResponse(
        access_token=create_access_token(admin),
        admin=AdminResponse.model_validate(admin),
    )


@router.get("/auth/me", response_model=AdminResponse)
async def get_admin_profile(
    admin: Admin = Depends(get_current_admin),
):
    return admin


@router.get("/orders", response_model=list[OrderResponse])
async def list_orders(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    _: Admin = Depends(get_current_admin),
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


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_admin_order(
    order_id: UUID,
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
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


# -------------------------
# Bulk Orders
# -------------------------

@router.get(
    "/bulk-orders",
    response_model=list[BulkOrderResponse],
)
async def list_bulk_orders(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BulkOrder)
        .order_by(BulkOrder.created_at.desc())
        .offset(offset)
        .limit(limit)
    )

    return result.scalars().all()


@router.get(
    "/bulk-orders/{bulk_order_id}",
    response_model=BulkOrderResponse,
)
async def get_admin_bulk_order(
    bulk_order_id: UUID,
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BulkOrder).where(BulkOrder.id == bulk_order_id)
    )

    bulk_order = result.scalar_one_or_none()

    if bulk_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bulk order not found",
        )

    return bulk_order


@router.patch(
    "/bulk-orders/{bulk_order_id}",
    response_model=BulkOrderResponse,
)
async def update_bulk_order(
    bulk_order_id: UUID,
    payload: BulkOrderUpdate,
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BulkOrder).where(BulkOrder.id == bulk_order_id)
    )

    bulk_order = result.scalar_one_or_none()

    if bulk_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bulk order not found",
        )

    if payload.status is not None:
        allowed_statuses = {
            "New",
            "Contacted",
            "Quoted",
            "Confirmed",
            "Completed",
            "Rejected",
        }

        if payload.status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid bulk order status",
            )

        bulk_order.status = payload.status

    await db.commit()
    await db.refresh(bulk_order)

    return bulk_order