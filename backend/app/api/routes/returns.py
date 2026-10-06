from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_admin
from app.db.dependencies import get_db
from app.models.admin import Admin
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.return_request import ReturnRequest
from app.schemas.return_request import (
    AdminReturnRequestResponse,
    ReturnRequestCreate,
    ReturnRequestResponse,
    ReturnRequestStatusUpdate,
)

router = APIRouter(prefix="/api/returns", tags=["returns"])


@router.post("/", response_model=ReturnRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_return_request(
    payload: ReturnRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    order_result = await db.execute(
        select(Order).where(
            Order.id == payload.order_id,
            Order.customer_phone == payload.customer_phone,
        )
    )
    if order_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if payload.order_item_id is not None:
        item_result = await db.execute(
            select(OrderItem.id).where(
                OrderItem.id == payload.order_item_id,
                OrderItem.order_id == payload.order_id,
            )
        )
        if item_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order item not found",
            )

    request = ReturnRequest(
        order_id=payload.order_id,
        order_item_id=payload.order_item_id,
        customer_phone=payload.customer_phone,
        request_type=payload.request_type.value,
        reason=payload.reason,
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


@router.get("/phone/{phone}", response_model=list[ReturnRequestResponse])
async def get_customer_return_requests(
    phone: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReturnRequest)
        .where(ReturnRequest.customer_phone == phone)
        .order_by(ReturnRequest.created_at.desc())
    )
    return result.scalars().all()


@router.get("/", response_model=list[AdminReturnRequestResponse])
async def list_return_requests(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReturnRequest)
        .order_by(ReturnRequest.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{request_id}", response_model=AdminReturnRequestResponse)
async def get_return_request(
    request_id: UUID,
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    request = await db.get(ReturnRequest, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found")
    return request


@router.patch("/{request_id}/status", response_model=AdminReturnRequestResponse)
async def update_return_request_status(
    request_id: UUID,
    payload: ReturnRequestStatusUpdate,
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    request = await db.get(ReturnRequest, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found")

    request.status = payload.status.value
    request.admin_notes = payload.admin_notes
    await db.commit()
    await db.refresh(request)
    return request