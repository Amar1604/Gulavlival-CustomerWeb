from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_manager
from app.models.user import User
from app.models.cash import CashRecord

router = APIRouter(prefix="/staff/cash", tags=["Cash Received"])


class CashRecordOut(BaseModel):
    id: str
    order_id: str
    order_number: str
    order_type: str
    rider_name: Optional[str] = None
    amount: float
    status: str
    received_at: Optional[datetime] = None
    confirmed_by: Optional[str] = None
    created_at: datetime


class ConfirmCashRequest(BaseModel):
    rider_name: Optional[str] = None


@router.get("", response_model=List[CashRecordOut])
def list_cash_records(
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    records = db.query(CashRecord).order_by(CashRecord.created_at.desc()).limit(100).all()
    return records


@router.post("/{id}/confirm", response_model=CashRecordOut)
def confirm_cash_received(
    id: str,
    req: ConfirmCashRequest,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    record = db.query(CashRecord).filter(CashRecord.id == id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cash record not found")
    
    record.status = "RECEIVED"
    record.received_at = datetime.now(timezone.utc)
    record.confirmed_by = f"{current_user.full_name} ({current_user.role})"
    if req.rider_name:
        record.rider_name = req.rider_name
    db.commit()
    db.refresh(record)
    return record
