import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True, index=True)
    customer_name = Column(String(128), nullable=False)
    customer_phone = Column(String(32), nullable=False)
    order_type = Column(String(32), nullable=False)  # DINE_IN, TAKEAWAY, DELIVERY
    table_number = Column(String(32), nullable=True)
    room_number = Column(String(32), nullable=True)
    delivery_address = Column(Text, nullable=True)
    status = Column(String(32), default="RECEIVED", nullable=False, index=True)
    payment_method = Column(String(32), default="CASH", nullable=False)
    payment_status = Column(String(32), default="PENDING", nullable=False)
    notes = Column(Text, nullable=True)
    
    # Financial snapshot
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0, nullable=False)
    delivery_fee = Column(Float, default=0.0, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    menu_item_id = Column(String(64), nullable=True)
    variant_id = Column(String(64), nullable=True)
    name = Column(String(255), nullable=False)  # Frozen item name snapshot
    variant_name = Column(String(128), nullable=True)  # Frozen variant snapshot
    unit_price = Column(Float, nullable=False)  # Frozen price snapshot
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    from_status = Column(String(32), nullable=True)
    to_status = Column(String(32), nullable=False)
    changed_by = Column(String(128), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="status_history")
