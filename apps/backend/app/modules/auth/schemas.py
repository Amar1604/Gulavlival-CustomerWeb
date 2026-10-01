from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=128)
    mobile: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = None
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email or Mobile number")
    password: str = Field(..., min_length=1)
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(..., description="Registered Email or Mobile")


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=128)
    mobile: Optional[str] = Field(None, min_length=10, max_length=15)
    email: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=128)


class UserOut(BaseModel):
    id: str
    name: str
    mobile: str
    email: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()

