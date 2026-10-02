import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.core.database import Base


class CashRecord(Base):
    __tablename__ = "cash_records"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(64), ForeignKey("orders.id"), nullable=False, index=True)
    order_number = Column(String(64), nullable=False)
    order_type = Column(String(32), nullable=False)
    rider_name = Column(String(128), nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String(32), default="PENDING", nullable=False)  # PENDING, RECEIVED
    received_at = Column(DateTime(timezone=True), nullable=True)
    confirmed_by = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
