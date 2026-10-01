import uuid
import random
from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.user import User
from app.models.menu import MenuItem, MenuVariant
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.modules.orders.schemas import CreateOrderRequest


class OrderService:
    @staticmethod
    def generate_order_number() -> str:
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        rand_suffix = random.randint(1000, 9999)
        return f"GG-{date_str}-{rand_suffix}"

    @staticmethod
    def create_order(db: Session, customer: User, req: CreateOrderRequest) -> Order:
        order_type = req.order_type.upper().strip()
        if order_type not in ["DINE_IN", "TAKEAWAY", "DELIVERY"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order type. Must be DINE_IN, TAKEAWAY, or DELIVERY."
            )

        if order_type == "DINE_IN" and not req.table_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Table number is required for Dine-in orders."
            )

        if order_type == "DELIVERY" and not req.delivery_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Delivery address is required for Delivery orders."
            )

        subtotal = 0.0
        calculated_items = []

        for item_req in req.items:
            # Validate item existence & availability
            menu_item = db.query(MenuItem).filter(
                MenuItem.id == item_req.menu_item_id
            ).first()
            if not menu_item:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Item not found or no longer active."
                )
            if not menu_item.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"'{menu_item.name}' is currently sold out."
                )

            # Determine unit price & variant snapshot
            unit_price = float(menu_item.base_price)
            variant_name = None
            if item_req.variant_id:
                variant = db.query(MenuVariant).filter(
                    MenuVariant.id == item_req.variant_id,
                    MenuVariant.menu_item_id == menu_item.id
                ).first()
                if not variant or not variant.is_available:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Selected size/variant is unavailable for '{menu_item.name}'."
                    )
                unit_price = float(variant.price)
                variant_name = variant.name

            line_total = unit_price * item_req.quantity
            subtotal += line_total

            calculated_items.append({
                "menu_item_id": menu_item.id,
                "variant_id": item_req.variant_id,
                "name": menu_item.name,
                "variant_name": variant_name,
                "unit_price": unit_price,
                "quantity": item_req.quantity,
                "total_price": line_total,
                "note": item_req.note
            })

        # Calculate taxes and delivery charge
        tax = round(subtotal * 0.05, 2)
        delivery_charge = 40.0 if order_type == "DELIVERY" else 0.0
        total = round(subtotal + tax + delivery_charge, 2)

        # Combine notes with change assistance and instructions
        note_parts = []
        if req.special_instructions:
            note_parts.append(f"Instructions: {req.special_instructions}")
        if req.change_for:
            note_parts.append(f"Change for: {req.change_for}")
        if req.whatsapp_updates:
            note_parts.append("WhatsApp updates requested: Yes")
        combined_notes = " | ".join(note_parts) if note_parts else None

        order_id = str(uuid.uuid4())
        order = Order(
            id=order_id,
            user_id=customer.id,
            order_number=OrderService.generate_order_number(),
            order_type=order_type,
            status="RECEIVED",
            payment_method="CASH",
            payment_status="PENDING",
            table_number=req.table_number.strip() if req.table_number else None,
            delivery_address=req.delivery_address.strip() if req.delivery_address else None,
            customer_name=customer.full_name or customer.email or "Customer",
            customer_phone=customer.phone or "Not Provided",
            subtotal=subtotal,
            tax=tax,
            delivery_fee=delivery_charge,
            discount=0.0,
            total=total,
            notes=combined_notes
        )
        db.add(order)
        db.flush()

        for c_item in calculated_items:
            order_item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                menu_item_id=c_item["menu_item_id"],
                variant_id=c_item["variant_id"],
                name=c_item["name"],
                variant_name=c_item["variant_name"],
                unit_price=c_item["unit_price"],
                quantity=c_item["quantity"],
                total_price=c_item["total_price"]
            )
            db.add(order_item)

        history = OrderStatusHistory(
            id=str(uuid.uuid4()),
            order_id=order.id,
            from_status=None,
            to_status="RECEIVED",
            changed_by="Customer Web",
            notes="Order placed by customer website."
        )
        db.add(history)
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def get_customer_orders(db: Session, customer: User) -> List[Order]:
        return db.query(Order).filter(
            Order.user_id == customer.id
        ).options(
            joinedload(Order.items)
        ).order_by(Order.created_at.desc()).all()

    @staticmethod
    def get_order_by_id(db: Session, customer: User, order_id: str) -> Order:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == customer.id
        ).options(
            joinedload(Order.items)
        ).first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found or unauthorized to view this order."
            )
        return order
