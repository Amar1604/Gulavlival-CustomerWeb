from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    menu_item_id: str
    variant_id: Optional[str] = None
    addon_ids: List[str] = []
    quantity: int = Field(..., ge=1, le=50)
    note: Optional[str] = None


class CreateOrderRequest(BaseModel):
    order_type: str = Field(..., description="DINE_IN, TAKEAWAY, or DELIVERY")
    table_number: Optional[str] = None
    delivery_address: Optional[str] = None
    change_for: Optional[str] = None
    special_instructions: Optional[str] = None
    whatsapp_updates: bool = False
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderItemOut(BaseModel):
    id: str
    menu_item_id: Optional[str] = None
    item_name_snapshot: str
    variant_name_snapshot: Optional[str] = None
    unit_price: float
    quantity: int
    line_total: float
    note: Optional[str] = None

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: str
    order_number: str
    order_type: str
    status: str
    table_number: Optional[str] = None
    delivery_address: Optional[str] = None
    customer_name: str
    customer_phone: str
    subtotal: float
    tax: float
    delivery_charge: float
    total: float
    payment_method: str
    special_instructions: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True
