import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class RestaurantReview(Base):
    __tablename__ = "restaurant_reviews"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(String(64), nullable=True, index=True)
    customer_name = Column(String(128), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    tags = Column(String(255), nullable=True)  # e.g., "Hot & Fresh, Fast Delivery"
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", backref="restaurant_review")


class MenuItemRating(Base):
    __tablename__ = "menu_item_ratings"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    menu_item_id = Column(String(64), ForeignKey("menu_items.id"), nullable=False, index=True)
    user_id = Column(String(64), nullable=True, index=True)
    customer_name = Column(String(128), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", backref="item_ratings")
    menu_item = relationship("MenuItem", backref="ratings")
