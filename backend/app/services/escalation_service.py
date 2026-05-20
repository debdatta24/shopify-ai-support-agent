"""Escalation routing and management service."""

from typing import Dict, List, Optional
from app.models.escalation import (
    Escalation, EscalationCreate, EscalationUpdate,
    EscalationPriority, EscalationStatus, AuditLogEntry,
)
from app.utils.helpers import generate_id, now_iso


# Valid status transitions
VALID_TRANSITIONS: Dict[EscalationStatus, List[EscalationStatus]] = {
    EscalationStatus.OPEN: [EscalationStatus.IN_PROGRESS, EscalationStatus.CLOSED],
    EscalationStatus.IN_PROGRESS: [EscalationStatus.AWAITING_CUSTOMER, EscalationStatus.RESOLVED, EscalationStatus.CLOSED],
    EscalationStatus.AWAITING_CUSTOMER: [EscalationStatus.IN_PROGRESS, EscalationStatus.RESOLVED, EscalationStatus.CLOSED],
    EscalationStatus.RESOLVED: [EscalationStatus.CLOSED, EscalationStatus.IN_PROGRESS],  # can reopen
    EscalationStatus.CLOSED: [],  # terminal
}

# Auto-assignment based on priority
PRIORITY_ROUTING = {
    EscalationPriority.CRITICAL: "Team Lead - Sarah K.",
    EscalationPriority.HIGH: "Senior Agent Pool",
    EscalationPriority.MEDIUM: "Agent Pool",
    EscalationPriority.LOW: "Agent Pool",
}


class EscalationService:
    """In-memory escalation management with priority routing and audit logs."""

    def __init__(self):
        self._escalations: Dict[str, Escalation] = {}
        self._seed_data()

    def _seed_data(self):
        """Seed initial mock escalation data."""
        seed = [
            Escalation(
                id="ESC-301", ticket_id="TKT-4521", customer_name="Jennifer Lopez",
                subject="Unauthorized charges on account",
                description="Customer reports multiple unauthorized transactions totaling $1,247.50. Possible account breach.",
                priority=EscalationPriority.CRITICAL, status=EscalationStatus.OPEN,
                assigned_to="Team Lead - Sarah K.",
                created_at="2026-05-19T08:00:00Z", updated_at="2026-05-19T08:00:00Z",
                audit_log=[
                    AuditLogEntry(id="log-1", action="Ticket created", performed_by="System", timestamp="2026-05-19T08:00:00Z", details="Auto-escalated due to fraud detection"),
                    AuditLogEntry(id="log-2", action="Assigned to Team Lead", performed_by="AI Routing", timestamp="2026-05-19T08:01:00Z"),
                ],
            ),
            Escalation(
                id="ESC-299", ticket_id="TKT-4518", customer_name="Thomas Wright",
                subject="Damaged premium item — $2,500",
                description="High-value electronics item arrived severely damaged. Customer provided photos.",
                priority=EscalationPriority.HIGH, status=EscalationStatus.IN_PROGRESS,
                assigned_to="Agent Martinez",
                created_at="2026-05-18T14:30:00Z", updated_at="2026-05-19T10:00:00Z",
                audit_log=[
                    AuditLogEntry(id="log-3", action="Ticket created", performed_by="Agent Lee", timestamp="2026-05-18T14:30:00Z"),
                    AuditLogEntry(id="log-4", action="Photos uploaded", performed_by="Customer", timestamp="2026-05-18T15:00:00Z"),
                    AuditLogEntry(id="log-5", action="Escalated to senior agent", performed_by="Agent Lee", timestamp="2026-05-18T15:30:00Z"),
                    AuditLogEntry(id="log-6", action="Replacement order initiated", performed_by="Agent Martinez", timestamp="2026-05-19T10:00:00Z"),
                ],
            ),
            Escalation(
                id="ESC-297", ticket_id="TKT-4515", customer_name="Amanda Foster",
                subject="Repeated delivery failures",
                description="Customer has experienced 3 consecutive failed delivery attempts.",
                priority=EscalationPriority.MEDIUM, status=EscalationStatus.AWAITING_CUSTOMER,
                assigned_to="Agent Johnson",
                created_at="2026-05-17T11:00:00Z", updated_at="2026-05-19T09:00:00Z",
                audit_log=[
                    AuditLogEntry(id="log-8", action="Ticket created", performed_by="AI Chat Bot", timestamp="2026-05-17T11:00:00Z"),
                    AuditLogEntry(id="log-9", action="Assigned to Agent Johnson", performed_by="System", timestamp="2026-05-17T11:05:00Z"),
                    AuditLogEntry(id="log-10", action="Customer contacted", performed_by="Agent Johnson", timestamp="2026-05-18T09:00:00Z"),
                ],
            ),
            Escalation(
                id="ESC-295", ticket_id="TKT-4510", customer_name="Kevin O'Brien",
                subject="Warranty claim dispute",
                description="Customer claiming warranty coverage for item purchased 14 months ago.",
                priority=EscalationPriority.LOW, status=EscalationStatus.RESOLVED,
                assigned_to="Agent Williams",
                created_at="2026-05-15T16:00:00Z", updated_at="2026-05-18T12:00:00Z",
                audit_log=[
                    AuditLogEntry(id="log-12", action="Ticket created", performed_by="Agent Park", timestamp="2026-05-15T16:00:00Z"),
                    AuditLogEntry(id="log-13", action="Goodwill gesture approved", performed_by="Supervisor Chen", timestamp="2026-05-17T14:00:00Z"),
                    AuditLogEntry(id="log-14", action="Customer accepted offer", performed_by="Agent Williams", timestamp="2026-05-18T12:00:00Z"),
                ],
            ),
        ]
        for e in seed:
            self._escalations[e.id] = e

    def create_escalation(self, data: EscalationCreate) -> Escalation:
        """Create a new escalation with auto-routing."""
        esc_id = generate_id("ESC-")
        ticket_id = data.ticket_id or generate_id("TKT-")
        now = now_iso()

        assigned_to = data.assigned_to or PRIORITY_ROUTING.get(data.priority, "Agent Pool")

        escalation = Escalation(
            id=esc_id,
            ticket_id=ticket_id,
            customer_name=data.customer_name,
            subject=data.subject,
            description=data.description,
            priority=data.priority,
            status=EscalationStatus.OPEN,
            assigned_to=assigned_to,
            created_at=now,
            updated_at=now,
            audit_log=[
                AuditLogEntry(
                    id=generate_id("log-"),
                    action="Escalation created",
                    performed_by="System",
                    timestamp=now,
                    details=f"Priority: {data.priority.value} — Auto-assigned to {assigned_to}",
                )
            ],
        )

        self._escalations[esc_id] = escalation
        return escalation

    def get_escalation(self, escalation_id: str) -> Optional[Escalation]:
        """Get an escalation by ID."""
        return self._escalations.get(escalation_id)

    def list_escalations(
        self,
        priority: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Escalation]:
        """List escalations with optional filters."""
        items = list(self._escalations.values())

        if priority and priority != "all":
            items = [e for e in items if e.priority == priority]
        if status and status != "all":
            items = [e for e in items if e.status == status]

        # Sort: critical first, then by created_at desc
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        items.sort(key=lambda e: (priority_order.get(e.priority, 4), e.created_at), reverse=False)
        return items

    def update_escalation(
        self, escalation_id: str, update: EscalationUpdate, performed_by: str = "Admin"
    ) -> Optional[Escalation]:
        """Update an escalation's status/assignment with audit logging."""
        esc = self._escalations.get(escalation_id)
        if not esc:
            return None

        now = now_iso()
        actions = []

        # Status update with validation
        if update.status:
            valid_next = VALID_TRANSITIONS.get(esc.status, [])
            if update.status not in valid_next:
                raise ValueError(
                    f"Invalid transition: {esc.status.value} → {update.status.value}. "
                    f"Valid: {[s.value for s in valid_next]}"
                )
            actions.append(f"Status changed: {esc.status.value} → {update.status.value}")
            esc.status = update.status

        # Priority update
        if update.priority and update.priority != esc.priority:
            actions.append(f"Priority changed: {esc.priority.value} → {update.priority.value}")
            esc.priority = update.priority

        # Assignment update
        if update.assigned_to and update.assigned_to != esc.assigned_to:
            actions.append(f"Reassigned: {esc.assigned_to} → {update.assigned_to}")
            esc.assigned_to = update.assigned_to

        # Create audit log entries
        for action in actions:
            esc.audit_log.append(
                AuditLogEntry(
                    id=generate_id("log-"),
                    action=action,
                    performed_by=performed_by,
                    timestamp=now,
                    details=update.notes,
                )
            )

        esc.updated_at = now
        self._escalations[escalation_id] = esc
        return esc
