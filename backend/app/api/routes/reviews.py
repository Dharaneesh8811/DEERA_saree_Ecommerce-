from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db
from app.core.security import get_current_admin
from app.models.product import Product
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate


router = APIRouter(
    prefix="/api/reviews",
    tags=["reviews"],
)


@router.post(
    "/",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_review(
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, review_data.product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    review = Review(
        product_id=review_data.product_id,
        customer_name=review_data.customer_name,
        rating=review_data.rating,
        comment=review_data.comment,
    )

    db.add(review)
    await db.commit()
    await db.refresh(review)

    return review


@router.get(
    "/product/{product_id}",
    response_model=list[ReviewResponse],
)
async def get_product_reviews(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    product = await db.get(Product, product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    result = await db.execute(
        select(Review)
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
    )

    return result.scalars().all()


@router.get(
    "/{review_id}",
    response_model=ReviewResponse,
)
async def get_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    review = await db.get(Review, review_id)

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    return review


@router.patch(
    "/{review_id}",
    response_model=ReviewResponse,
)
async def update_review(
    review_id: UUID,
    review_data: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    review = await db.get(Review, review_id)

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    update_data = review_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(review, field, value)

    await db.commit()
    await db.refresh(review)

    return review


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    review = await db.get(Review, review_id)

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    await db.delete(review)
    await db.commit()