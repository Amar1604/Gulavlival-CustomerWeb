import uuid
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_owner
from app.core.security import get_password_hash
from app.models.user import User

router = APIRouter(prefix="/staff/team", tags=["Team Management"])


class AddTeamMemberRequest(BaseModel):
    phone: str
    full_name: str
    role: str  # STAFF, MANAGER, OWNER
    pin: Optional[str] = "1234"


class ResetPinRequest(BaseModel):
    new_pin: str


class TeamMemberOut(BaseModel):
    id: str
    phone: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


@router.get("", response_model=List[TeamMemberOut])
def list_team_members(
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    members = db.query(User).filter(
        User.role.in_(["STAFF", "MANAGER", "OWNER"])
    ).order_by(User.created_at.desc()).all()
    return members


@router.post("", response_model=TeamMemberOut)
def add_team_member(
    req: AddTeamMemberRequest,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    clean_phone = req.phone.strip()
    role_upper = req.role.strip().upper()
    if role_upper not in ["STAFF", "MANAGER", "OWNER"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be STAFF, MANAGER, or OWNER.",
        )
    
    existing = db.query(User).filter(User.phone == clean_phone).first()
    if existing:
        # If user existed as customer or staff, update role & activate
        existing.role = role_upper
        existing.full_name = req.full_name.strip()
        existing.is_active = True
        if req.pin and req.pin.strip():
            existing.password_hash = get_password_hash(req.pin.strip())
        db.commit()
        db.refresh(existing)
        return existing

    new_user = User(
        id=str(uuid.uuid4()),
        phone=clean_phone,
        full_name=req.full_name.strip(),
        role=role_upper,
        password_hash=get_password_hash(req.pin.strip() if req.pin and req.pin.strip() else "1234"),
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/{id}/reset-pin", response_model=TeamMemberOut)
def reset_member_pin(
    id: str,
    req: ResetPinRequest,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    clean_pin = req.new_pin.strip()
    if len(clean_pin) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN must be at least 4 digits.",
        )

    member = db.query(User).filter(User.id == id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")

    member.password_hash = get_password_hash(clean_pin)
    db.commit()
    db.refresh(member)
    return member



@router.patch("/{id}/toggle-active", response_model=TeamMemberOut)
def toggle_member_active(
    id: str,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    member = db.query(User).filter(User.id == id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Safety check: Cannot disable self if sole active owner
    if member.role == "OWNER" and member.is_active:
        active_owners = db.query(User).filter(User.role == "OWNER", User.is_active == True).count()
        if active_owners <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disable the last active Owner account.",
            )

    member.is_active = not member.is_active
    db.commit()
    db.refresh(member)
    return member


@router.delete("/{id}")
def delete_team_member(
    id: str,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    member = db.query(User).filter(User.id == id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if member.role == "OWNER":
        active_owners = db.query(User).filter(User.role == "OWNER", User.is_active == True).count()
        if active_owners <= 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must maintain at least two Owner accounts.",
            )

    db.delete(member)
    db.commit()
    return {"message": "Team member removed."}
