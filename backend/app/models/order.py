from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class OrderStatus(str, Enum):
    PROCESSING = "processing"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"


class TimelineEvent(BaseModel):
    """A single event in an order's timeline."""
    status: str
    description: str
    timestamp: str
    completed: bool


class OrderItem(BaseModel):
    """An item in an order."""
    id: str
    name: str
    quantity: int
    price: float
    image: Optional[str] = None


class Order(BaseModel):
    """Full order model."""
    id: str
    customer_name: str
    customer_email: str
    items: List[OrderItem]
    total: float
    status: OrderStatus
    created_at: str
    updated_at: str
    tracking_number: Optional[str] = None
    shipping_address: str
    timeline: List[TimelineEvent] = []
