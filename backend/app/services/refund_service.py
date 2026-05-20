"""Refund workflow engine with state machine and auto-escalation."""

from typing import Dict, List, Optional
from app.models.refund import RefundRequest, RefundCreate, RefundUpdate, RefundStatus, RefundReason
from app.utils.helpers import generate_id, now_iso


# Valid state transitions
VALID_TRANSITIONS: Dict[RefundStatus, List[RefundStatus]] = {
    RefundStatus.PENDING: [RefundStatus.UNDER_REVIEW, RefundStatus.REJECTED],
    RefundStatus.UNDER_REVIEW: [RefundStatus.APPROVED, RefundStatus.REJECTED],
    RefundStatus.APPROVED: [RefundStatus.COMPLETED],
    RefundStatus.REJECTED: [],  # terminal state
    RefundStatus.COMPLETED: [],  # terminal state
}

AUTO_ESCALATION_THRESHOLD = 500.0  # auto-escalate refunds above this amount


class RefundService:
    """In-memory refund workflow engine."""

    def __init__(self):
        self._refunds: Dict[str, RefundRequest] = {}
        self._seed_data()

    def _seed_data(self):
        """Seed initial mock refund data."""
        seed = [
            RefundRequest(
                id="REF-1042", order_id="ORD-7825", customer_name="James Wilson",
                reason=RefundReason.DEFECTIVE, description="The chair arrived with a broken armrest.",
                amount=449.0, status=RefundStatus.APPROVED,
                created_at="2026-05-19T11:00:00Z", updated_at="2026-05-19T14:30:00Z",
            ),
            RefundRequest(
                id="REF-1041", order_id="ORD-7810", customer_name="Maria Garcia",
                reason=RefundReason.WRONG_ITEM, description="Received a red speaker instead of blue.",
                amount=79.99, status=RefundStatus.PENDING,
                created_at="2026-05-19T09:30:00Z", updated_at="2026-05-19T09:30:00Z",
            ),
            RefundRequest(
                id="REF-1039", order_id="ORD-7800", customer_name="Robert Kim",
                reason=RefundReason.NOT_AS_DESCRIBED, description="Product quality does not match listing.",
                amount=129.99, status=RefundStatus.UNDER_REVIEW,
                created_at="2026-05-18T15:00:00Z", updated_at="2026-05-19T08:00:00Z",
            ),
            RefundRequest(
                id="REF-1037", order_id="ORD-7795", customer_name="Lisa Anderson",
                reason=RefundReason.ARRIVED_LATE, description="Package arrived 10 days late.",
                amount=64.50, status=RefundStatus.COMPLETED,
                created_at="2026-05-17T10:00:00Z", updated_at="2026-05-18T16:00:00Z",
            ),
            RefundRequest(
                id="REF-1035", order_id="ORD-7790", customer_name="Michael Brown",
                reason=RefundReason.CHANGED_MIND, description="No longer need this item.",
                amount=199.99, status=RefundStatus.REJECTED,
                created_at="2026-05-16T12:00:00Z", updated_at="2026-05-17T14:00:00Z",
            ),
        ]
        for r in seed:
            self._refunds[r.id] = r

    def create_refund(
        self, data: RefundCreate, customer_name: str, order_total: float
    ) -> RefundRequest:
        """Create a new refund request."""
        refund_id = generate_id("REF-")
        amount = data.amount if data.amount else order_total
        now = now_iso()

        refund = RefundRequest(
            id=refund_id,
            order_id=data.order_id,
            customer_name=customer_name,
            reason=data.reason,
            description=data.description,
            amount=amount,
            status=RefundStatus.PENDING,
            created_at=now,
            updated_at=now,
        )

        self._refunds[refund_id] = refund
        return refund

    def should_auto_escalate(self, refund: RefundRequest) -> bool:
        """Check if a refund should be auto-escalated (high value)."""
        return refund.amount > AUTO_ESCALATION_THRESHOLD

    def get_refund(self, refund_id: str) -> Optional[RefundRequest]:
        """Get a refund by ID."""
        return self._refunds.get(refund_id)

    def list_refunds(
        self,
        status: Optional[str] = None,
        order_id: Optional[str] = None,
    ) -> List[RefundRequest]:
        """List refunds with optional filters."""
        refunds = list(self._refunds.values())

        if status and status != "all":
            refunds = [r for r in refunds if r.status == status]
        if order_id:
            refunds = [r for r in refunds if r.order_id == order_id]

        # Sort by created_at descending
        refunds.sort(key=lambda r: r.created_at, reverse=True)
        return refunds

    def update_status(
        self, refund_id: str, update: RefundUpdate
    ) -> Optional[RefundRequest]:
        """Update a refund's status with validation."""
        refund = self._refunds.get(refund_id)
        if not refund:
            return None

        # Validate state transition
        valid_next = VALID_TRANSITIONS.get(refund.status, [])
        if update.status not in valid_next:
            raise ValueError(
                f"Invalid transition: {refund.status.value} → {update.status.value}. "
                f"Valid next states: {[s.value for s in valid_next]}"
            )

        refund.status = update.status
        refund.updated_at = now_iso()
        if update.admin_notes:
            refund.admin_notes = update.admin_notes

        self._refunds[refund_id] = refund
        return refund
