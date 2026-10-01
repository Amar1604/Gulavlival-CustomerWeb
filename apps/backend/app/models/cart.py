import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Cart(Base):
    __tablename__ = "carts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    session_id = Column(String(128), index=True, nullable=True)  # For guest cart association
    status = Column(String(32), default="ACTIVE", nullable=False)  # ACTIVE, MERGED, CONVERTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cart_id = Column(UUID(as_uuid=True), ForeignKey("carts.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("menu_variants.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    special_note = Column(String(256), nullable=True)

    cart = relationship("Cart", back_populates="items")
    menu_item = relationship("MenuItem")
    variant = relationship("MenuVariant")
