from typing import List, Optional
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.dependencies import require_staff, require_manager
from app.models.user import User
from app.models.order import Order, OrderStatusHistory
from app.models.cash import CashRecord
from app.modules.orders.schemas import OrderOut, OrderItemOut

router = APIRouter(prefix="/staff/orders", tags=["Staff Orders"])


def _format_order(order: Order) -> OrderOut:
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


@router.get("", response_model=List[OrderOut])
def list_staff_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    order_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    query = db.query(Order).options(joinedload(Order.items))
    if status_filter:
        query = query.filter(Order.status == status_filter.upper())
    if order_type:
        query = query.filter(Order.order_type == order_type.upper())
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return [_format_order(o) for o in orders]


@router.get("/{id}", response_model=OrderOut)
def get_staff_order_detail(
    id: str,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _format_order(order)


@router.post("/{id}/confirm", response_model=OrderOut)
def confirm_order(
    id: str,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Idempotent: if already confirmed, simply return it
    if order.status != "CONFIRMED":
        prev_status = order.status
        order.status = "CONFIRMED"
        order.updated_at = datetime.now(timezone.utc)
        
        history = OrderStatusHistory(
            id=str(uuid.uuid4()),
            order_id=order.id,
            from_status=prev_status,
            to_status="CONFIRMED",
            changed_by=f"{current_user.full_name} ({current_user.role})",
            notes="Order confirmed by staff and sent to kitchen."
        )
        db.add(history)
        db.commit()
        db.refresh(order)

    return _format_order(order)


@router.post("/{id}/delivered", response_model=OrderOut)
def mark_order_delivered(
    id: str,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order.status != "DELIVERED":
        prev_status = order.status
        order.status = "DELIVERED"
        order.payment_status = "PAID"
        order.updated_at = datetime.now(timezone.utc)
        
        history = OrderStatusHistory(
            id=str(uuid.uuid4()),
            order_id=order.id,
            from_status=prev_status,
            to_status="DELIVERED",
            changed_by=f"{current_user.full_name} ({current_user.role})",
            notes="Order marked delivered and cash marked as paid."
        )
        db.add(history)

        # If delivery order, ensure cash record exists
        if order.order_type == "DELIVERY":
            existing_cash = db.query(CashRecord).filter(CashRecord.order_id == order.id).first()
            if not existing_cash:
                cash_rec = CashRecord(
                    id=str(uuid.uuid4()),
                    order_id=order.id,
                    order_number=order.order_number,
                    order_type=order.order_type,
                    amount=order.total,
                    status="PENDING",
                    created_at=datetime.now(timezone.utc),
                )
                db.add(cash_rec)

        db.commit()
        db.refresh(order)

    return _format_order(order)


@router.post("/{id}/cancel", response_model=OrderOut)
def cancel_order(
    id: str,
    reason: Optional[str] = Query(None),
    current_user: User = Depends(require_manager),
    db: Session = Depends(get_db),
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    prev_status = order.status
    order.status = "CANCELLED"
    order.updated_at = datetime.now(timezone.utc)

    history = OrderStatusHistory(
        id=str(uuid.uuid4()),
        order_id=order.id,
        from_status=prev_status,
        to_status="CANCELLED",
        changed_by=f"{current_user.full_name} ({current_user.role})",
        notes=f"Cancelled by {current_user.role}. Reason: {reason or 'No reason provided'}"
    )
    db.add(history)
    db.commit()
    return _format_order(order)


from pydantic import BaseModel


class StaffCreateOrderItem(BaseModel):
    menu_item_id: str
    quantity: int
    note: Optional[str] = None


class StaffCreateOrderRequest(BaseModel):
    order_type: str = "DINE_IN"
    table_number: Optional[str] = None
    customer_name: Optional[str] = "Walk-in Guest"
    customer_phone: Optional[str] = "9876543210"
    delivery_address: Optional[str] = None
    special_instructions: Optional[str] = None
    items: List[StaffCreateOrderItem]


@router.post("/create", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def staff_create_order(
    req: StaffCreateOrderRequest,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    from app.models.menu import MenuItem
    from app.models.order import OrderItem
    from app.models.settings import RestaurantSettings
    import random

    if not req.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item.")

    subtotal = 0.0
    items_to_create = []

    for item_req in req.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_req.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Menu item '{item_req.menu_item_id}' not found.")

        line_total = float(menu_item.base_price) * item_req.quantity
        subtotal += line_total
        items_to_create.append({
            "menu_item_id": menu_item.id,
            "name": menu_item.name,
            "unit_price": float(menu_item.base_price),
            "quantity": item_req.quantity,
            "total_price": line_total,
        })

    # Read tax and delivery settings
    settings = db.query(RestaurantSettings).first()
    tax_rate = (settings.tax_percentage / 100.0) if settings else 0.05
    delivery_fee = (settings.delivery_charge if req.order_type.upper() == "DELIVERY" else 0.0) if settings else 0.0
    tax = round(subtotal * tax_rate, 2)
    total = round(subtotal + tax + delivery_fee, 2)

    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    rand_suffix = random.randint(1000, 9999)
    order_number = f"GG-{date_str}-{rand_suffix}"

    order = Order(
        id=str(uuid.uuid4()),
        user_id=None,
        order_number=order_number,
        order_type=req.order_type.upper(),
        status="CONFIRMED",  # Staff counter orders are immediately confirmed
        payment_method="CASH",
        payment_status="PENDING",
        table_number=req.table_number.strip() if req.table_number else None,
        delivery_address=req.delivery_address.strip() if req.delivery_address else None,
        customer_name=req.customer_name.strip() if req.customer_name else "Walk-in Guest",
        customer_phone=req.customer_phone.strip() if req.customer_phone else "9876543210",
        subtotal=subtotal,
        tax=tax,
        delivery_fee=delivery_fee,
        discount=0.0,
        total=total,
        notes=req.special_instructions,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(order)
    db.flush()

    for item_data in items_to_create:
        order_item = OrderItem(
            id=str(uuid.uuid4()),
            order_id=order.id,
            menu_item_id=item_data["menu_item_id"],
            variant_id=None,
            name=item_data["name"],
            variant_name=None,
            unit_price=item_data["unit_price"],
            quantity=item_data["quantity"],
            total_price=item_data["total_price"],
        )
        db.add(order_item)

    history = OrderStatusHistory(
        id=str(uuid.uuid4()),
        order_id=order.id,
        from_status=None,
        to_status="CONFIRMED",
        changed_by=f"Counter POS: {current_user.full_name} ({current_user.role})",
        notes="Order taken at counter by staff."
    )
    db.add(history)
    db.commit()
    db.refresh(order)

    # Real-time WebSocket broadcast
    try:
        import asyncio
        from app.core.websocket import order_ws_manager
        loop = asyncio.get_event_loop()
        if loop.is_running():
            payload = {
                "event": "NEW_ORDER",
                "order": {
                    "id": order.id,
                    "order_number": order.order_number,
                    "order_type": order.order_type,
                    "table_number": order.table_number,
                    "customer_name": order.customer_name,
                    "total": order.total,
                    "created_at": order.created_at.isoformat() if order.created_at else "",
                }
            }
            asyncio.ensure_future(order_ws_manager.broadcast(payload))
    except Exception:
        pass

    return _format_order(order)


@router.get("/stats/today")
def get_today_order_stats(
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    from sqlalchemy import func
    from datetime import date
    
    today_start = datetime.combine(date.today(), datetime.min.time(), tzinfo=timezone.utc)
    
    total_orders = db.query(func.count(Order.id)).filter(Order.created_at >= today_start).scalar() or 0
    total_revenue = db.query(func.sum(Order.total)).filter(Order.created_at >= today_start).scalar() or 0.0
    active_orders = db.query(func.count(Order.id)).filter(
        Order.created_at >= today_start,
        Order.status.in_(["RECEIVED", "CONFIRMED"])
    ).scalar() or 0
    delivered_orders = db.query(func.count(Order.id)).filter(
        Order.created_at >= today_start,
        Order.status == "DELIVERED"
    ).scalar() or 0

    return {
        "date": date.today().isoformat(),
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "active_orders": active_orders,
        "delivered_orders": delivered_orders,
    }

