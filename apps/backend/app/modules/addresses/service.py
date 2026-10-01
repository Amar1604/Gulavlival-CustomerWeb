import uuid
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.address import UserAddress
from app.modules.addresses.schemas import CreateAddressRequest, UpdateAddressRequest


class AddressService:
    @staticmethod
    def get_user_addresses(db: Session, current_user: User) -> List[UserAddress]:
        return (
            db.query(UserAddress)
            .filter(UserAddress.user_id == current_user.id)
            .order_by(UserAddress.is_default.desc(), UserAddress.created_at.desc())
            .all()
        )

    @staticmethod
    def create_address(db: Session, current_user: User, req: CreateAddressRequest) -> UserAddress:
        # If this is the user's first address, make it default automatically
        existing_count = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).count()
        make_default = req.is_default or (existing_count == 0)

        if make_default:
            # Unset existing default addresses for this user
            db.query(UserAddress).filter(UserAddress.user_id == current_user.id).update(
                {"is_default": False}
            )

        new_addr = UserAddress(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            label=req.label.strip() or "Home",
            address_line=req.address_line.strip(),
            landmark=req.landmark.strip() if req.landmark else None,
            city=req.city.strip() if req.city else "Gulavlival",
            pincode=req.pincode.strip() if req.pincode else None,
            is_default=make_default,
        )
        db.add(new_addr)
        db.commit()
        db.refresh(new_addr)
        return new_addr

    @staticmethod
    def update_address(
        db: Session, current_user: User, address_id: str, req: UpdateAddressRequest
    ) -> UserAddress:
        addr = (
            db.query(UserAddress)
            .filter(UserAddress.id == address_id, UserAddress.user_id == current_user.id)
            .first()
        )
        if not addr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found."
            )

        if req.is_default is True:
            # Clear default flag on all other addresses
            db.query(UserAddress).filter(
                UserAddress.user_id == current_user.id,
                UserAddress.id != address_id
            ).update({"is_default": False})
            addr.is_default = True
        elif req.is_default is False:
            addr.is_default = False

        if req.label is not None:
            addr.label = req.label.strip() or "Home"
        if req.address_line is not None:
            addr.address_line = req.address_line.strip()
        if req.landmark is not None:
            addr.landmark = req.landmark.strip() if req.landmark else None
        if req.city is not None:
            addr.city = req.city.strip() if req.city else "Gulavlival"
        if req.pincode is not None:
            addr.pincode = req.pincode.strip() if req.pincode else None

        db.commit()
        db.refresh(addr)
        return addr

    @staticmethod
    def delete_address(db: Session, current_user: User, address_id: str) -> dict:
        addr = (
            db.query(UserAddress)
            .filter(UserAddress.id == address_id, UserAddress.user_id == current_user.id)
            .first()
        )
        if not addr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found."
            )

        was_default = addr.is_default
        db.delete(addr)
        db.commit()

        # If deleted address was default, promote the newest remaining address to default
        if was_default:
            remaining = (
                db.query(UserAddress)
                .filter(UserAddress.user_id == current_user.id)
                .order_by(UserAddress.created_at.desc())
                .first()
            )
            if remaining:
                remaining.is_default = True
                db.commit()

        return {"message": "Address deleted successfully."}
