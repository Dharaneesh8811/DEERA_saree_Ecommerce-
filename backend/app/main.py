from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.categories import router as categories_router
from app.api.routes.products import router as products_router
from app.api.routes.product_variants import router as product_variants_router
from app.api.routes.product_images import router as product_images_router
from app.api.routes.reviews import router as reviews_router
from app.api.routes.coupons import router as coupons_router
from app.api.routes.orders import router as orders_router
from app.api.routes.admin import router as admin_router
from app.api.routes.returns import router as returns_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.bulk_orders import router as bulk_orders_router

from app.db.dependencies import get_db


app = FastAPI(
    title="DERA Silk API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories_router)
app.include_router(products_router)
app.include_router(product_variants_router)
app.include_router(product_images_router)
app.include_router(reviews_router)
app.include_router(coupons_router)
app.include_router(orders_router)
app.include_router(admin_router)
app.include_router(returns_router)
app.include_router(analytics_router)
app.include_router(bulk_orders_router)


@app.get("/")
async def root():
    return {
        "message": "DERA Silk API is running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }


@app.get("/health/db")
async def database_health(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(text("SELECT current_database()"))
    database_name = result.scalar_one()

    return {
        "status": "connected",
        "database": database_name,
    }