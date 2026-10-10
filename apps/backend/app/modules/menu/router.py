import re
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.menu.schemas import CategoryOut, MenuItemOut, VariantOut
from app.modules.menu.service import MenuService

router = APIRouter(tags=["Menu"])


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[-\s]+", "-", text)


def format_menu_item(item) -> MenuItemOut:
    return MenuItemOut(
        id=item.id,
        category_id=item.category_id,
        category_name=item.category_name or (item.category.name if item.category else None),
        name=item.name,
        slug=slugify(item.name),
        description=item.description,
        base_price=float(item.base_price),
        image_url=item.image_url or item.image,
        is_veg=bool(item.is_veg if item.is_veg is not None else item.veg),
        is_bestseller=bool(item.is_bestseller if item.is_bestseller is not None else item.popular),
        is_available=bool(item.is_available),
        rating=float(getattr(item, "rating", 4.5) or 4.5),
        rating_count=int(getattr(item, "rating_count", 0) or 0),
        variants=[
            VariantOut(
                id=v.id,
                name=v.name,
                price=float(v.price),
                is_available=bool(v.is_available)
            )
            for v in (item.variants or [])
        ]
    )


@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    categories = MenuService.get_categories(db)
    results = []
    for cat in categories:
        items = [format_menu_item(item) for item in (cat.menu_items or [])]
        results.append(
            CategoryOut(
                id=cat.id,
                name=cat.name,
                slug=slugify(cat.name),
                description=cat.description,
                sort_order=cat.sort_order,
                items=items
            )
        )
    return results


@router.get("/menu", response_model=List[MenuItemOut])
@router.get("/menu/items", response_model=List[MenuItemOut])
def get_menu(
    category: Optional[str] = Query(None, description="Category filter"),
    db: Session = Depends(get_db)
):
    items = MenuService.get_full_menu(db, category_name=category)
    return [format_menu_item(item) for item in items]


@router.get("/menu/{slug}", response_model=MenuItemOut)
def get_menu_item(slug: str, db: Session = Depends(get_db)):
    item = MenuService.get_item_by_id_or_name(db, slug)
    return format_menu_item(item)
