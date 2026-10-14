from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import create_access_token, get_current_admin, verify_password
from app.db.dependencies import get_db
from app.models.admin import Admin
from app.models.bulk_order import BulkOrder
from app.models.contact_message import ContactMessage
from app.models.order import Order
from app.schemas.admin import AdminLogin, AdminResponse, AdminTokenResponse
from app.schemas.bulk_order import BulkOrderResponse, BulkOrderUpdate
from app.schemas.contact_message import (
    ContactMessageListResponse,
    ContactMessageResponse,
    ContactMessageStatusUpdate,
)
from app.schemas.order import OrderResponse
from app.schemas.pagination import PageResponse


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


@router.get("/orders/page", response_model=PageResponse[OrderResponse])
async def list_orders_page(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total = await db.scalar(select(func.count()).select_from(Order))
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc(), Order.id.desc())
        .offset(offset)
        .limit(limit)
    )

    return {"items": result.scalars().all(), "total": total or 0}


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


@router.get(
    "/messages",
    response_model=list[ContactMessageListResponse],
)
async def list_contact_messages(
    query: str | None = Query(default=None, max_length=100),
    message_status: Literal["New", "Read"] | None = Query(
        default=None,
        alias="status",
    ),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    statement = select(ContactMessage)

    if query and query.strip():
        search_term = f"%{query.strip()}%"
        statement = statement.where(
            or_(
                ContactMessage.name.ilike(search_term),
                ContactMessage.email.ilike(search_term),
                ContactMessage.subject.ilike(search_term),
                ContactMessage.message.ilike(search_term),
            )
        )

    if message_status:
        statement = statement.where(ContactMessage.status == message_status)

    result = await db.execute(
        statement
        .order_by(ContactMessage.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


@router.get(
    "/messages/page",
    response_model=PageResponse[ContactMessageListResponse],
)
async def list_contact_messages_page(
    query: str | None = Query(default=None, max_length=100),
    message_status: Literal["New", "Read"] | None = Query(
        default=None,
        alias="status",
    ),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    conditions = []

    if query and query.strip():
        search_term = f"%{query.strip()}%"
        conditions.append(
            or_(
                ContactMessage.name.ilike(search_term),
                ContactMessage.email.ilike(search_term),
                ContactMessage.subject.ilike(search_term),
                ContactMessage.message.ilike(search_term),
            )
        )

    if message_status:
        conditions.append(ContactMessage.status == message_status)

    total = await db.scalar(
        select(func.count())
        .select_from(ContactMessage)
        .where(*conditions)
    )
    result = await db.execute(
        select(ContactMessage)
        .where(*conditions)
        .order_by(ContactMessage.created_at.desc(), ContactMessage.id.desc())
        .offset(offset)
        .limit(limit)
    )
    return {"items": result.scalars().all(), "total": total or 0}


@router.get(
    "/messages/{message_id}",
    response_model=ContactMessageResponse,
)
async def get_admin_contact_message(
    message_id: UUID,
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    message = await db.get(ContactMessage, message_id)

    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    return message


@router.patch(
    "/messages/{message_id}/status",
    response_model=ContactMessageResponse,
)
async def update_contact_message_status(
    message_id: UUID,
    payload: ContactMessageStatusUpdate,
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    message = await db.get(ContactMessage, message_id)

    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )

    message.status = payload.status
    await db.commit()
    await db.refresh(message)
    return message


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
    "/bulk-orders/page",
    response_model=PageResponse[BulkOrderResponse],
)
async def list_bulk_orders_page(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    _: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total = await db.scalar(select(func.count()).select_from(BulkOrder))
    counts_result = await db.execute(
        select(BulkOrder.status, func.count()).group_by(BulkOrder.status)
    )
    result = await db.execute(
        select(BulkOrder)
        .order_by(BulkOrder.created_at.desc(), BulkOrder.id.desc())
        .offset(offset)
        .limit(limit)
    )

    return {
        "items": result.scalars().all(),
        "total": total or 0,
        "status_counts": dict(counts_result.all()),
    }


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