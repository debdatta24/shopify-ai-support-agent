from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class RefundStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


class RefundReason(str, Enum):
    DEFECTIVE = "defective"
    WRONG_ITEM = "wrong_item"
    NOT_AS_DESCRIBED = "not_as_described"
    ARRIVED_LATE = "arrived_late"
    CHANGED_MIND = "changed_mind"
    OTHER = "other"


class RefundCreate(BaseModel):
    """Request body to create a refund."""
    order_id: str
    reason: RefundReason
    description: str = Field(..., min_length=10, max_length=1000)
    amount: Optional[float] = None  # if None, full order amount


class RefundUpdate(BaseModel):
    """Request body to update a refund status."""
    status: RefundStatus
    admin_notes: Optional[str] = None


class RefundRequest(BaseModel):
    """Full refund request model."""
    id: str
    order_id: str
    customer_name: str
    reason: RefundReason
    description: str
    amount: float
    status: RefundStatus
    admin_notes: Optional[str] = None
    created_at: str
    updated_at: str
    escalation_id: Optional[str] = None  # linked escalation if auto-escalated
