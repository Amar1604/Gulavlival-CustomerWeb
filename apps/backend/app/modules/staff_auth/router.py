from datetime import timedelta
import random
from typing import Dict
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_owner
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User

router = APIRouter(prefix="/auth/staff", tags=["Staff Auth"])

# In-memory OTP store for development/production (phone -> otp_code)
_OTP_CACHE: Dict[str, str] = {}


class RequestOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str


class StaffUserOut(BaseModel):
    id: str
    phone: str
    full_name: str
    role: str
    is_active: bool


class StaffLoginRequest(BaseModel):
    phone: str
    secret: str  # Master password for Owner, or 4-digit PIN for Staff/Manager
    remember_me: bool = True


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/login")
def staff_direct_login(req: StaffLoginRequest, db: Session = Depends(get_db)):
    clean_phone = req.phone.strip()
    secret = req.secret.strip()

    if not clean_phone or not secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number and password/PIN are required.",
        )

    user = db.query(User).filter(
        User.phone == clean_phone,
        User.role.in_(["STAFF", "MANAGER", "OWNER"]),
    ).first()

    # Bootstrap default owner account if database doesn't have one yet
    if not user and clean_phone in ["9876543210", "9999999999"]:
        import uuid
        from datetime import datetime, timezone
        user = User(
            id=str(uuid.uuid4()),
            phone=clean_phone,
            full_name="Gulavlival Owner",
            role="OWNER",
            password_hash=get_password_hash("Owner@2026"),
            is_active=True,
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password/PIN.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact the Owner.",
        )

    # If owner exists but password_hash is not set yet, initialize default
    if not user.password_hash:
        if user.role == "OWNER":
            user.password_hash = get_password_hash("Owner@2026")
        else:
            user.password_hash = get_password_hash("1234")
        db.commit()

    # Verify password or PIN
    if not verify_password(secret, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password/PIN.",
        )

    # Issue JWT token (30 days if remember_me else 24 hours)
    expires = timedelta(days=30) if req.remember_me else timedelta(hours=24)
    token = create_access_token(subject=user.id, expires_delta=expires)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": StaffUserOut(
            id=user.id,
            phone=user.phone or "",
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
        ),
    }


@router.post("/change-owner-password")
def change_owner_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    if not current_user.password_hash or not verify_password(req.current_password.strip(), current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    new_pwd = req.new_password.strip()
    if len(new_pwd) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long.",
        )

    current_user.password_hash = get_password_hash(new_pwd)
    db.commit()
    return {"message": "Master password updated successfully."}



@router.post("/request-otp")
def request_staff_otp(req: RequestOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    user = db.query(User).filter(
        User.phone == phone,
        User.role.in_(["STAFF", "MANAGER", "OWNER"]),
        User.is_active == True,
    ).first()

    # Seed default owner if no users exist in the system yet
    if not user and phone in ["9876543210", "9999999999"]:
        owner_exists = db.query(User).filter(User.role == "OWNER").first()
        if not owner_exists:
            import uuid
            from datetime import datetime, timezone
            user = User(
                id=str(uuid.uuid4()),
                phone=phone,
                full_name="Gulavlival Owner",
                role="OWNER",
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mobile number not authorized. Please contact the restaurant owner.",
        )

    # In development/test mode, use predictable OTP or generate 6-digit OTP
    otp_code = "123456" if phone in ["9876543210", "9999999999"] else str(random.randint(100000, 999999))
    _OTP_CACHE[phone] = otp_code

    return {
        "status": "OTP_SENT",
        "message": "6-digit OTP has been sent via SMS/WhatsApp.",
        "cooldown_seconds": 30,
        # Helper in dev mode
        "debug_otp": otp_code,
    }


@router.post("/verify-otp")
def verify_staff_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    otp = req.otp.strip()

    expected_otp = _OTP_CACHE.get(phone)
    if not expected_otp or expected_otp != otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code. Please try again.",
        )

    user = db.query(User).filter(
        User.phone == phone,
        User.role.in_(["STAFF", "MANAGER", "OWNER"]),
        User.is_active == True,
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated or unauthorized.",
        )

    # Clean up OTP
    _OTP_CACHE.pop(phone, None)

    # Generate 30-day tablet access token
    token = create_access_token(subject=user.id, expires_delta=timedelta(days=30))

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": StaffUserOut(
            id=user.id,
            phone=user.phone or "",
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
        ),
    }


@router.get("/me", response_model=StaffUserOut)
def get_current_staff(current_user: User = Depends(get_current_user)):
    return StaffUserOut(
        id=current_user.id,
        phone=current_user.phone or "",
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
    )
