import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import get_optional_user
from app.core.websocket import menu_ws_manager
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.menu import MenuItem
from app.models.settings import RestaurantSettings
from app.models.review import RestaurantReview, MenuItemRating
from app.modules.reviews.schemas import (
    SubmitOrderReviewRequest,
    OrderReviewStatusResponse,
    RestaurantReviewOut,
    DishRatingOut,
)

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])


@router.post("/orders/{order_id}", status_code=status.HTTP_201_CREATED)
async def submit_order_review(
    order_id: str,
    req: SubmitOrderReviewRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    # 1. Fetch Order
    order = db.query(Order).filter(
        (Order.id == order_id) | (Order.order_number == order_id)
    ).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )

    customer_name = (
        current_user.full_name
        if current_user
        else (order.customer_name or "Verified Diner")
    )
    user_id = current_user.id if current_user else order.user_id

    # 2. Check if already reviewed
    existing_rest_review = db.query(RestaurantReview).filter(
        RestaurantReview.order_id == order.id
    ).first()

    # 3. Save Overall Restaurant Review
    if req.restaurant_rating is not None and not existing_rest_review:
        new_rest_review = RestaurantReview(
            id=str(uuid.uuid4()),
            order_id=order.id,
            user_id=user_id,
            customer_name=customer_name,
            rating=req.restaurant_rating,
            tags=req.restaurant_tags,
            comment=req.restaurant_comment,
            created_at=datetime.now(timezone.utc),
        )
        db.add(new_rest_review)

    # 4. Save Individual Dish Ratings
    # Collect valid menu_item_ids from the order
    order_item_ids = {
        item.menu_item_id
        for item in order.items
        if item.menu_item_id
    }

    rated_item_ids = set()

    for dish_req in req.dish_ratings:
        # Verify dish belongs to this order
        if dish_req.menu_item_id not in order_item_ids:
            continue

        # Prevent duplicate rating for the same order & item
        existing_dish_rating = db.query(MenuItemRating).filter(
            MenuItemRating.order_id == order.id,
            MenuItemRating.menu_item_id == dish_req.menu_item_id,
        ).first()

        if not existing_dish_rating:
            new_dish_rating = MenuItemRating(
                id=str(uuid.uuid4()),
                order_id=order.id,
                menu_item_id=dish_req.menu_item_id,
                user_id=user_id,
                customer_name=customer_name,
                rating=dish_req.rating,
                review_text=dish_req.review_text,
                created_at=datetime.now(timezone.utc),
            )
            db.add(new_dish_rating)
            rated_item_ids.add(dish_req.menu_item_id)

    db.flush()

    # 5. Recalculate Dish Ratings
    for item_id in rated_item_ids:
        avg_rating = db.query(func.avg(MenuItemRating.rating)).filter(
            MenuItemRating.menu_item_id == item_id
        ).scalar()
        rating_count = db.query(func.count(MenuItemRating.id)).filter(
            MenuItemRating.menu_item_id == item_id
        ).scalar()

        item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
        if item and avg_rating is not None:
            item.rating = round(float(avg_rating), 1)
            item.rating_count = int(rating_count)

            # Broadcast live dish rating update via WebSocket
            try:
                await menu_ws_manager.broadcast({
                    "type": "MENU_ITEM_UPDATED",
                    "item": {
                        "id": item.id,
                        "name": item.name,
                        "rating": item.rating,
                        "rating_count": item.rating_count,
                    }
                })
            except Exception:
                pass

    # 6. Recalculate Overall Restaurant Rating
    avg_restaurant = db.query(func.avg(RestaurantReview.rating)).scalar()
    total_rest_reviews = db.query(func.count(RestaurantReview.id)).scalar()

    settings = db.query(RestaurantSettings).first()
    if settings and avg_restaurant is not None:
        settings.average_rating = round(float(avg_restaurant), 1)
        settings.total_reviews = int(total_rest_reviews)

    db.commit()

    return {
        "status": "success",
        "message": "Thank you! Your ratings have been submitted.",
        "order_id": order.id,
    }


@router.get("/orders/{order_id}", response_model=OrderReviewStatusResponse)
def get_order_review_status(
    order_id: str,
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(
        (Order.id == order_id) | (Order.order_number == order_id)
    ).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )

    rest_review = db.query(RestaurantReview).filter(
        RestaurantReview.order_id == order.id
    ).first()

    dish_ratings = db.query(MenuItemRating).filter(
        MenuItemRating.order_id == order.id
    ).all()

    already_reviewed = (rest_review is not None) or (len(dish_ratings) > 0)

    return OrderReviewStatusResponse(
        order_id=order.id,
        already_reviewed=already_reviewed,
        restaurant_review=(
            RestaurantReviewOut.model_validate(rest_review)
            if rest_review
            else None
        ),
        dish_ratings=[
            DishRatingOut.model_validate(dr)
            for dr in dish_ratings
        ],
    )


@router.get("/menu/items/{item_id}")
def get_dish_ratings(
    item_id: str,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found."
        )

    reviews = db.query(MenuItemRating).filter(
        MenuItemRating.menu_item_id == item_id
    ).order_by(MenuItemRating.created_at.desc()).limit(limit).all()

    return {
        "item_id": item.id,
        "name": item.name,
        "average_rating": float(item.rating or 4.5),
        "total_ratings": int(item.rating_count or 0),
        "recent_reviews": [
            {
                "id": r.id,
                "customer_name": r.customer_name,
                "rating": r.rating,
                "review_text": r.review_text,
                "created_at": r.created_at.isoformat(),
            }
            for r in reviews
        ],
    }
