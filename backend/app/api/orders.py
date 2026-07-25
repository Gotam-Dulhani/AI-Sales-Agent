from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate, Order as OrderSchema, OrderUpdate
from app.api.deps import get_current_active_user
import uuid

router = APIRouter()


@router.post("/", response_model=OrderSchema)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new order."""
    # Generate order number
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    # Calculate totals
    subtotal = sum(item.unit_price * item.quantity for item in order_in.items)
    tax = subtotal * 0.17  # 17% tax (Pakistan standard)
    shipping_cost = 200  # Fixed shipping cost
    total = subtotal + tax + shipping_cost
    
    # Create order
    order = Order(
        business_id=order_in.business_id,
        customer_id=order_in.customer_id,
        order_number=order_number,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total,
        notes=order_in.notes,
        shipping_address=order_in.shipping_address
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items
    for item_in in order_in.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity,
            unit_price=item_in.unit_price,
            total_price=item_in.unit_price * item_in.quantity
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(order)
    
    return order


@router.get("/", response_model=List[OrderSchema])
async def get_orders(
    business_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all orders for a business."""
    orders = db.query(Order).filter(
        Order.business_id == business_id
    ).offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderSchema)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific order by ID."""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order


@router.put("/{order_id}", response_model=OrderSchema)
async def update_order(
    order_id: int,
    order_in: OrderUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for field, value in order_in.dict(exclude_unset=True).items():
        setattr(order, field, value)
    
    db.commit()
    db.refresh(order)
    
    return order


@router.get("/customer/{customer_id}", response_model=List[OrderSchema])
async def get_customer_orders(
    customer_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all orders for a customer."""
    orders = db.query(Order).filter(Order.customer_id == customer_id).all()
    return orders
