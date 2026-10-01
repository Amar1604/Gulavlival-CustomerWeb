from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.modules.orders.schemas import CreateOrderRequest, OrderOut, OrderItemOut
from app.modules.orders.service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


def _format_order(order) -> OrderOut:
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        order_type=order.order_type,
        status=order.status,
        table_number=order.table_number,
        delivery_address=order.delivery_address,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        subtotal=order.subtotal,
        tax=order.tax,
        delivery_charge=order.delivery_fee,
        total=order.total,
        payment_method=order.payment_method,
        special_instructions=order.notes,
        created_at=order.created_at,
        items=[
            OrderItemOut(
                id=item.id,
                item_name_snapshot=item.name,
                variant_name_snapshot=item.variant_name,
                unit_price=item.unit_price,
                quantity=item.quantity,
                line_total=item.total_price,
            )
            for item in (order.items or [])
        ],
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = OrderService.create_order(db, current_user, req)
    return _format_order(order)


@router.get("", response_model=List[OrderOut])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = OrderService.get_customer_orders(db, current_user)
    return [_format_order(o) for o in orders]


@router.get("/{id}", response_model=OrderOut)
def get_order_detail(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = OrderService.get_order_by_id(db, current_user, id)
    return _format_order(order)
