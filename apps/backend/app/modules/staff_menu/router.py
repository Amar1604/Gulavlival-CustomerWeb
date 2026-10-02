import uuid
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_manager, require_owner
from app.models.user import User
from app.models.menu import Category, MenuItem, MenuPriceHistory

router = APIRouter(prefix="/staff/menu", tags=["Staff Menu"])


class UpdateAvailabilityRequest(BaseModel):
    is_available: bool


class UpdatePriceRequest(BaseModel):
    new_price: float
    reason: Optional[str] = None


@router.patch("/items/{id}/availability")
def update_item_availability(
    id: str,
    req: UpdateAvailabilityRequest,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    item = db.query(MenuItem).filter(MenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    
    item.is_available = req.is_available
    item.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {
        "id": item.id,
        "name": item.name,
        "is_available": item.is_available,
        "message": f"'{item.name}' marked as {'available' if item.is_available else 'sold out'}."
    }


@router.patch("/items/{id}/price")
def update_item_price(
    id: str,
    req: UpdatePriceRequest,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    item = db.query(MenuItem).filter(MenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    
    old_price = item.base_price
    item.base_price = req.new_price
    item.updated_at = datetime.now(timezone.utc)

    # Record price change audit
    history = MenuPriceHistory(
        id=str(uuid.uuid4()),
        menu_item_id=item.id,
        old_price=old_price,
        new_price=req.new_price,
        changed_by=f"{current_user.full_name} ({current_user.role})",
        reason=req.reason,
        created_at=datetime.now(timezone.utc),
    )
    db.add(history)
    db.commit()
    return {
        "id": item.id,
        "name": item.name,
        "old_price": old_price,
        "new_price": item.base_price,
        "message": f"Price updated for '{item.name}'."
    }


class CreateMenuItemRequest(BaseModel):
    name: str
    category_name: str
    base_price: float
    description: Optional[str] = None
    is_veg: bool = True
    image_url: Optional[str] = None


@router.post("/items")
def create_menu_item(
    req: CreateMenuItemRequest,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    if not req.name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dish name is required")
    if req.base_price <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Price must be greater than 0")
    
    cat_name = req.category_name.strip()
    if not cat_name:
        cat_name = "General"

    # Find or create category
    category = db.query(Category).filter(Category.name == cat_name).first()
    if not category:
        category = Category(
            id=str(uuid.uuid4()),
            name=cat_name,
            slug=cat_name.lower().replace(" ", "-").replace("&", "and"),
            sort_order=99,
        )
        db.add(category)
        db.flush()

    new_item = MenuItem(
        id=str(uuid.uuid4()),
        category_id=category.id,
        category_name=category.name,
        name=req.name.strip(),
        slug=req.name.strip().lower().replace(" ", "-") + f"-{uuid.uuid4().hex[:6]}",
        description=req.description.strip() if req.description else None,
        base_price=float(req.base_price),
        image=req.image_url.strip() if req.image_url else None,
        image_url=req.image_url.strip() if req.image_url else None,
        veg=req.is_veg,
        is_veg=req.is_veg,
        is_available=True,
        is_bestseller=False,
        popular=False,
        rating=4.5,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "id": new_item.id,
        "category_id": new_item.category_id,
        "category_name": new_item.category_name,
        "name": new_item.name,
        "slug": new_item.slug,
        "description": new_item.description,
        "base_price": new_item.base_price,
        "image_url": new_item.image_url,
        "is_veg": new_item.is_veg,
        "is_bestseller": new_item.is_bestseller,
        "is_available": new_item.is_available,
        "variants": [],
        "message": f"Dish '{new_item.name}' added successfully."
    }


@router.delete("/items/{id}")
def delete_menu_item(
    id: str,
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    item = db.query(MenuItem).filter(MenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")

    item_name = item.name

    # Delete any price history associated with this item
    db.query(MenuPriceHistory).filter(MenuPriceHistory.menu_item_id == item.id).delete()

    # Delete item (variants and add_ons cascade deleted)
    db.delete(item)
    db.commit()

    return {
        "id": id,
        "name": item_name,
        "message": f"Dish '{item_name}' deleted successfully."
    }

