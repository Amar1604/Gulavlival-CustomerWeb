import uuid
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_owner
from app.models.user import User
from app.models.settings import RestaurantSettings

router = APIRouter(tags=["Settings"])


class UpdateSettingsRequest(BaseModel):
    is_open: Optional[bool] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    tax_percentage: Optional[float] = None
    delivery_charge: Optional[float] = None
    min_delivery_order: Optional[float] = None
    delivery_area: Optional[str] = None
    whatsapp_notification_phone: Optional[str] = None


def _get_or_create_settings(db: Session) -> RestaurantSettings:
    settings = db.query(RestaurantSettings).first()
    if not settings:
        settings = RestaurantSettings(
            id=str(uuid.uuid4()),
            is_open=True,
            opening_time="11:00 AM",
            closing_time="11:00 PM",
            tax_percentage=5.0,
            delivery_charge=40.0,
            min_delivery_order=200.0,
            delivery_area="Within 5 km radius",
            whatsapp_notification_phone="9876543210",
            updated_at=datetime.now(timezone.utc),
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/settings/public")
def get_public_settings(db: Session = Depends(get_db)):
    settings = _get_or_create_settings(db)
    return {
        "is_open": settings.is_open,
        "opening_time": settings.opening_time,
        "closing_time": settings.closing_time,
        "tax_percentage": settings.tax_percentage,
        "delivery_charge": settings.delivery_charge,
        "min_delivery_order": settings.min_delivery_order,
        "delivery_area": settings.delivery_area,
        "average_rating": float(getattr(settings, "average_rating", 4.8) or 4.8),
        "total_reviews": int(getattr(settings, "total_reviews", 128) or 128),
    }


@router.get("/staff/settings")
def get_staff_settings(
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    settings = _get_or_create_settings(db)
    return settings


@router.patch("/staff/settings")
def update_staff_settings(
    req: UpdateSettingsRequest,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    settings = _get_or_create_settings(db)
    if req.is_open is not None:
        settings.is_open = req.is_open
    if req.opening_time is not None:
        settings.opening_time = req.opening_time
    if req.closing_time is not None:
        settings.closing_time = req.closing_time
    if req.tax_percentage is not None:
        settings.tax_percentage = req.tax_percentage
    if req.delivery_charge is not None:
        settings.delivery_charge = req.delivery_charge
    if req.min_delivery_order is not None:
        settings.min_delivery_order = req.min_delivery_order
    if req.delivery_area is not None:
        settings.delivery_area = req.delivery_area
    if req.whatsapp_notification_phone is not None:
        settings.whatsapp_notification_phone = req.whatsapp_notification_phone

    settings.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(settings)
    return settings
