from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus, PaymentStatus


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemInDB(OrderItemBase):
    id: int
    order_id: int
    total_price: float
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderItem(OrderItemInDB):
    pass


class OrderBase(BaseModel):
    business_id: int
    customer_id: int
    notes: Optional[str] = None
    shipping_address: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    notes: Optional[str] = None
    shipping_address: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None


class OrderInDB(OrderBase):
    id: int
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    subtotal: float
    tax: float
    shipping_cost: float
    discount: float
    total: float
    currency: str
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Order(OrderInDB):
    items: Optional[List[OrderItem]] = []
