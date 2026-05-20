from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class EscalationPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class EscalationStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    AWAITING_CUSTOMER = "awaiting_customer"
    RESOLVED = "resolved"
    CLOSED = "closed"


class AuditLogEntry(BaseModel):
    """A single audit log entry."""
    id: str
    action: str
    performed_by: str
    timestamp: str
    details: Optional[str] = None


class EscalationCreate(BaseModel):
    """Request body to create an escalation."""
    ticket_id: Optional[str] = None
    customer_name: str
    subject: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    priority: EscalationPriority = EscalationPriority.MEDIUM
    assigned_to: Optional[str] = None


class EscalationUpdate(BaseModel):
    """Request body to update an escalation."""
    status: Optional[EscalationStatus] = None
    priority: Optional[EscalationPriority] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None  # added to audit log


class Escalation(BaseModel):
    """Full escalation model."""
    id: str
    ticket_id: str
    customer_name: str
    subject: str
    description: str
    priority: EscalationPriority
    status: EscalationStatus
    assigned_to: str
    created_at: str
    updated_at: str
    audit_log: List[AuditLogEntry] = []
