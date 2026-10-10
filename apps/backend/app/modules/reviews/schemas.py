from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class DishRatingItem(BaseModel):
    menu_item_id: str
    rating: int = Field(..., ge=1, le=5, description="1 to 5 star rating")
    review_text: Optional[str] = Field(None, max_length=500)


class SubmitOrderReviewRequest(BaseModel):
    restaurant_rating: Optional[int] = Field(None, ge=1, le=5)
    restaurant_tags: Optional[str] = Field(None, max_length=255)
    restaurant_comment: Optional[str] = Field(None, max_length=1000)
    dish_ratings: List[DishRatingItem] = []


class DishRatingOut(BaseModel):
    id: str
    menu_item_id: str
    rating: int
    review_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RestaurantReviewOut(BaseModel):
    id: str
    rating: int
    tags: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderReviewStatusResponse(BaseModel):
    order_id: str
    already_reviewed: bool
    restaurant_review: Optional[RestaurantReviewOut] = None
    dish_ratings: List[DishRatingOut] = []
