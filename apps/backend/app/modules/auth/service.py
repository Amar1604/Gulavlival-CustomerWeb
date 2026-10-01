import uuid
from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_reset_token,
    decode_reset_token,
)
from app.modules.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserOut,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
)


class AuthService:
    @staticmethod
    def register(db: Session, req: RegisterRequest) -> TokenResponse:
        # Check if phone exists
        existing_phone = db.query(User).filter(User.phone == req.mobile).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this mobile number already exists."
            )
        
        # Check if email exists (if provided)
        if req.email:
            existing_email = db.query(User).filter(User.email == req.email.lower()).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email address already exists."
                )

        new_user = User(
            id=str(uuid.uuid4()),
            full_name=req.name.strip(),
            phone=req.mobile.strip(),
            email=req.email.strip().lower() if req.email else None,
            password_hash=get_password_hash(req.password),
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token(subject=str(new_user.id))
        return TokenResponse(
            access_token=token,
            user=UserOut(
                id=str(new_user.id),
                name=new_user.full_name,
                mobile=new_user.phone or "",
                email=new_user.email,
                is_active=new_user.is_active
            )
        )

    @staticmethod
    def login(db: Session, req: LoginRequest) -> TokenResponse:
        identifier = req.identifier.strip()
        user = db.query(User).filter(
            or_(User.email == identifier.lower(), User.phone == identifier)
        ).first()

        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email/mobile or password."
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Please contact support."
            )

        delta = timedelta(days=30) if req.remember_me else timedelta(days=7)
        token = create_access_token(subject=str(user.id), expires_delta=delta)
        
        return TokenResponse(
            access_token=token,
            user=UserOut(
                id=str(user.id),
                name=user.full_name,
                mobile=user.phone or "",
                email=user.email,
                is_active=user.is_active
            )
        )

    @staticmethod
    def forgot_password(db: Session, req: ForgotPasswordRequest) -> ForgotPasswordResponse:
        identifier = req.identifier.strip()
        user = db.query(User).filter(
            or_(User.email == identifier.lower(), User.phone == identifier)
        ).first()

        if not user:
            # Per security standards, don't expose if account exists or not
            return ForgotPasswordResponse(
                message="If this account is registered, password reset instructions have been dispatched.",
                reset_token=None,
            )

        token = create_reset_token(user.id, expires_minutes=15)
        return ForgotPasswordResponse(
            message="Password reset link/token generated successfully. Valid for 15 minutes.",
            reset_token=token,
        )

    @staticmethod
    def reset_password(db: Session, req: ResetPasswordRequest) -> dict:
        user_id = decode_reset_token(req.token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset link. Please request a new one."
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )

        user.password_hash = get_password_hash(req.new_password)
        db.commit()

        return {"message": "Your password has been reset successfully. You can now sign in."}

    @staticmethod
    def update_profile(db: Session, current_user: User, req: UpdateProfileRequest) -> UserOut:
        if req.name and req.name.strip():
            current_user.full_name = req.name.strip()

        if req.mobile and req.mobile.strip():
            new_phone = req.mobile.strip()
            if new_phone != current_user.phone:
                conflict = db.query(User).filter(User.phone == new_phone, User.id != current_user.id).first()
                if conflict:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Another account is already registered with this mobile number."
                    )
                current_user.phone = new_phone

        if req.email is not None:
            new_email = req.email.strip().lower() if req.email.strip() else None
            if new_email and new_email != current_user.email:
                conflict = db.query(User).filter(User.email == new_email, User.id != current_user.id).first()
                if conflict:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Another account is already registered with this email address."
                    )
            current_user.email = new_email

        db.commit()
        db.refresh(current_user)

        return UserOut(
            id=str(current_user.id),
            name=current_user.full_name,
            mobile=current_user.phone or "",
            email=current_user.email,
            is_active=current_user.is_active
        )

    @staticmethod
    def change_password(db: Session, current_user: User, req: ChangePasswordRequest) -> dict:
        if not verify_password(req.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The current password you entered is incorrect."
            )

        current_user.password_hash = get_password_hash(req.new_password)
        db.commit()

        return {"message": "Password changed successfully."}

