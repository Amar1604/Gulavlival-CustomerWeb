from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AddressBase(BaseModel):
    label: str = Field("Home", description="Home, Work, Hotel Room, or Other")
    address_line: str = Field(..., min_length=3, description="Flat/House no, Street, Area")
    landmark: Optional[str] = None
    city: str = Field("Gulavlival", min_length=2)
    pincode: Optional[str] = None
    is_default: bool = False


class CreateAddressRequest(AddressBase):
    pass


class UpdateAddressRequest(BaseModel):
    label: Optional[str] = None
    address_line: Optional[str] = None
    landmark: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    is_default: Optional[bool] = None


class AddressOut(AddressBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
