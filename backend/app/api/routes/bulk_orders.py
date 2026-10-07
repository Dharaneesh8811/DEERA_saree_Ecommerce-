from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db
from app.models.bulk_order import BulkOrder
from app.schemas.bulk_order import BulkOrderCreate, BulkOrderResponse


router = APIRouter(
    prefix="/api/bulk-orders",
    tags=["Bulk Orders"],
)


@router.post(
    "",
    response_model=BulkOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_bulk_order(
    data: BulkOrderCreate,
    db: AsyncSession = Depends(get_db),
):
    bulk_order = BulkOrder(
        customer_name=data.customer_name,
        company_name=data.company_name,
        email=data.email,
        phone=data.phone,
        product_category=data.product_category,
        quantity=data.quantity,
        required_date=data.required_date,
        budget=data.budget,
        message=data.message,
        status="New",
    )

    db.add(bulk_order)
    await db.commit()
    await db.refresh(bulk_order)

    return bulk_order