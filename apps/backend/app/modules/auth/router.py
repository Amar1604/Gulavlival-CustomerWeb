from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.modules.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserOut,
)
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return AuthService.register(db, req)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return AuthService.login(db, req)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=str(current_user.id),
        name=current_user.full_name or "",
        mobile=current_user.phone or "",
        email=current_user.email,
        is_active=current_user.is_active,
    )


@router.put("/profile", response_model=UserOut)
def update_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AuthService.update_profile(db, current_user, req)


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AuthService.change_password(db, current_user, req)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return AuthService.forgot_password(db, req)


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    return AuthService.reset_password(db, req)

