from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_admin
from app.db.dependencies import get_db
from app.models.category import Category
from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product


router = APIRouter(
    prefix="/api/admin",
    tags=["admin analytics"],
)


@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    # Total active products
    products_result = await db.execute(
        select(func.count(Product.id)).where(
            Product.is_active.is_(True)
        )
    )
    total_products = products_result.scalar_one()

    # Total active categories
    categories_result = await db.execute(
        select(func.count(Category.id)).where(
            Category.is_active.is_(True)
        )
    )
    total_categories = categories_result.scalar_one()

    # Total orders
    orders_result = await db.execute(
        select(func.count(Order.id))
    )
    total_orders = orders_result.scalar_one()

    # Total revenue
    revenue_result = await db.execute(
        select(
            func.coalesce(
                func.sum(Order.final_amount),
                Decimal("0.00"),
            )
        )
    )

    total_revenue = (
        revenue_result.scalar_one()
        or Decimal("0.00")
    )

    # Average order value
    average_order_value = (
        total_revenue / total_orders
        if total_orders > 0
        else Decimal("0.00")
    )

    # Order status counts
    status_result = await db.execute(
        select(
            Order.status,
            func.count(Order.id),
        ).group_by(Order.status)
    )

    status_counts = {
        status.value: count
        for status, count in status_result.all()
    }

    order_status = {
        "placed": status_counts.get(
            OrderStatus.PLACED.value,
            0,
        ),
        "under_review": status_counts.get(
            OrderStatus.UNDER_REVIEW.value,
            0,
        ),
        "confirmed": status_counts.get(
            OrderStatus.CONFIRMED.value,
            0,
        ),
        "shipped": status_counts.get(
            OrderStatus.SHIPPED.value,
            0,
        ),
    }

    # Sales by category
    category_result = await db.execute(
        select(
            Category.name,
            func.coalesce(
                func.sum(OrderItem.subtotal),
                Decimal("0.00"),
            ),
        )
        .join(
            Product,
            Product.category_id == Category.id,
        )
        .join(
            OrderItem,
            OrderItem.product_id == Product.id,
        )
        .group_by(
            Category.id,
            Category.name,
        )
        .order_by(
            func.sum(OrderItem.subtotal).desc()
        )
    )

    sales_by_category = [
        {
            "category": category_name,
            "sales": float(sales or 0),
        }
        for category_name, sales
        in category_result.all()
    ]

    # Top products
    top_products_result = await db.execute(
        select(
            OrderItem.product_name,
            func.coalesce(
                func.sum(OrderItem.quantity),
                0,
            ),
            func.coalesce(
                func.sum(OrderItem.subtotal),
                Decimal("0.00"),
            ),
        )
        .group_by(
            OrderItem.product_id,
            OrderItem.product_name,
        )
        .order_by(
            func.sum(OrderItem.quantity).desc()
        )
        .limit(5)
    )

    top_products = [
        {
            "product_name": product_name,
            "quantity_sold": int(quantity or 0),
            "sales": float(sales or 0),
        }
        for product_name, quantity, sales
        in top_products_result.all()
    ]

    # Recent orders
    recent_orders_result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
        .limit(5)
    )

    recent_orders = [
        {
            "id": str(order.id),
            "customer_name": order.customer_name,
            "amount": float(order.final_amount),
            "status": order.status.value,
            "created_at": order.created_at.isoformat(),
        }
        for order in recent_orders_result.scalars().all()
    ]

    return {
        "overview": {
            "total_products": total_products,
            "total_categories": total_categories,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "average_order_value": float(
                average_order_value
            ),
        },
        "order_status": order_status,
        "sales_by_category": sales_by_category,
        "top_products": top_products,
        "recent_orders": recent_orders,
    }