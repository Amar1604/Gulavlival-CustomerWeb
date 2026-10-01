from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.modules.addresses.schemas import (
    AddressOut,
    CreateAddressRequest,
    UpdateAddressRequest,
)
from app.modules.addresses.service import AddressService

router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.get("", response_model=List[AddressOut])
def get_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AddressService.get_user_addresses(db, current_user)


@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_address(
    req: CreateAddressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AddressService.create_address(db, current_user, req)


@router.put("/{id}", response_model=AddressOut)
def update_address(
    id: str,
    req: UpdateAddressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AddressService.update_address(db, current_user, id, req)


@router.delete("/{id}")
def delete_address(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AddressService.delete_address(db, current_user, id)
