from typing import List, Optional
from pydantic import BaseModel


class VariantOut(BaseModel):
    id: str
    name: str
    price: float
    is_available: bool

    class Config:
        from_attributes = True


class MenuItemOut(BaseModel):
    id: str
    category_id: str
    category_name: Optional[str] = None
    name: str
    slug: str
    description: Optional[str] = None
    base_price: float
    image_url: Optional[str] = None
    is_veg: bool = True
    is_bestseller: bool = False
    is_available: bool = True
    variants: List[VariantOut] = []

    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    sort_order: int
    items: List[MenuItemOut] = []

    class Config:
        from_attributes = True
