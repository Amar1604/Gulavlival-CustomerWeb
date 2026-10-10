import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(128), nullable=False)
    slug = Column(String(128), unique=True, nullable=True, index=True)
    description = Column(String(256), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    menu_items = relationship("MenuItem", back_populates="category", order_by="MenuItem.name")

    @property
    def items(self):
        return self.menu_items


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String(64), ForeignKey("categories.id"), nullable=False, index=True)
    category_name = Column(String(128), nullable=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=True, index=True)
    description = Column(Text, nullable=True)
    base_price = Column(Float, nullable=False)
    image = Column(String(512), nullable=True)
    image_url = Column(String(512), nullable=True)
    veg = Column(Boolean, default=True, nullable=False)
    is_veg = Column(Boolean, default=True, nullable=False)
    popular = Column(Boolean, default=False, nullable=True)
    is_bestseller = Column(Boolean, default=False, nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    rating = Column(Float, default=4.5, nullable=True)
    rating_count = Column(Integer, default=0, nullable=True)
    calories = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)

    category = relationship("Category", back_populates="menu_items")
    variants = relationship("MenuVariant", back_populates="menu_item", cascade="all, delete-orphan")
    add_ons = relationship("AddOn", back_populates="menu_item", cascade="all, delete-orphan")


class MenuVariant(Base):
    __tablename__ = "menu_variants"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    menu_item_id = Column(String(64), ForeignKey("menu_items.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    price = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)

    menu_item = relationship("MenuItem", back_populates="variants")


class AddOn(Base):
    __tablename__ = "add_ons"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    menu_item_id = Column(String(64), ForeignKey("menu_items.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    price = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)

    menu_item = relationship("MenuItem", back_populates="add_ons")


class MenuPriceHistory(Base):
    __tablename__ = "menu_price_history"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    menu_item_id = Column(String(64), ForeignKey("menu_items.id"), nullable=False, index=True)
    old_price = Column(Float, nullable=False)
    new_price = Column(Float, nullable=False)
    changed_by = Column(String(128), nullable=False)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

