import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Float, DateTime
from app.core.database import Base


class RestaurantSettings(Base):
    __tablename__ = "restaurant_settings"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    is_open = Column(Boolean, default=True, nullable=False)
    opening_time = Column(String(32), default="11:00 AM", nullable=False)
    closing_time = Column(String(32), default="11:00 PM", nullable=False)
    tax_percentage = Column(Float, default=5.0, nullable=False)
    delivery_charge = Column(Float, default=40.0, nullable=False)
    min_delivery_order = Column(Float, default=200.0, nullable=False)
    delivery_area = Column(String(255), default="Within 5 km radius", nullable=False)
    whatsapp_notification_phone = Column(String(32), default="9876543210", nullable=False)
    average_rating = Column(Float, default=4.8, nullable=False)
    total_reviews = Column(Integer, default=128, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
