import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(32), default="Home", nullable=False)  # Home, Work, Hotel Room, Other
    address_line = Column(Text, nullable=False)
    landmark = Column(String(255), nullable=True)
    city = Column(String(64), default="Gulavlival", nullable=False)
    pincode = Column(String(16), nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="addresses")
