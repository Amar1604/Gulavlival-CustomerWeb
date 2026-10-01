from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.menu import Category, MenuItem


class MenuService:
    @staticmethod
    def get_categories(db: Session) -> List[Category]:
        return db.query(Category).order_by(Category.sort_order).all()

    @staticmethod
    def get_full_menu(db: Session, category_name: Optional[str] = None) -> List[MenuItem]:
        query = db.query(MenuItem).options(
            joinedload(MenuItem.variants),
            joinedload(MenuItem.category)
        )
        if category_name:
            query = query.join(Category).filter(Category.name.ilike(f"%{category_name}%"))

        return query.order_by(MenuItem.name).all()

    @staticmethod
    def get_item_by_id_or_name(db: Session, identifier: str) -> MenuItem:
        item = db.query(MenuItem).filter(
            (MenuItem.id == identifier) | (MenuItem.name.ilike(identifier))
        ).options(
            joinedload(MenuItem.variants),
            joinedload(MenuItem.category)
        ).first()

        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
        return item
