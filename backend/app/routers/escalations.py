"""Escalations router — admin escalation management."""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List

from app.dependencies import get_escalation_service
from app.services.escalation_service import EscalationService
from app.models.escalation import Escalation, EscalationCreate, EscalationUpdate
from app.models.common import APIResponse

router = APIRouter()


@router.post("", response_model=APIResponse[Escalation])
async def create_escalation(
    data: EscalationCreate,
    esc_svc: EscalationService = Depends(get_escalation_service),
):
    """Create a new escalation with automatic priority-based routing."""
    escalation = esc_svc.create_escalation(data)
    return APIResponse(data=escalation, message="Escalation created")


@router.get("", response_model=APIResponse[List[Escalation]])
async def list_escalations(
    priority: Optional[str] = Query(None, description="Filter by priority level"),
    status: Optional[str] = Query(None, description="Filter by escalation status"),
    esc_svc: EscalationService = Depends(get_escalation_service),
):
    """List all escalations with optional priority and status filters."""
    escalations = esc_svc.list_escalations(priority=priority, status=status)
    return APIResponse(data=escalations, message=f"{len(escalations)} escalations found")


@router.get("/{escalation_id}", response_model=APIResponse[Escalation])
async def get_escalation(
    escalation_id: str,
    esc_svc: EscalationService = Depends(get_escalation_service),
):
    """Get a single escalation with full audit log."""
    escalation = esc_svc.get_escalation(escalation_id)
    if not escalation:
        raise HTTPException(status_code=404, detail=f"Escalation {escalation_id} not found")
    return APIResponse(data=escalation)


@router.patch("/{escalation_id}", response_model=APIResponse[Escalation])
async def update_escalation(
    escalation_id: str,
    update: EscalationUpdate,
    esc_svc: EscalationService = Depends(get_escalation_service),
):
    """Update an escalation's status, priority, or assignment. Changes are audit-logged."""
    try:
        escalation = esc_svc.update_escalation(escalation_id, update)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not escalation:
        raise HTTPException(status_code=404, detail=f"Escalation {escalation_id} not found")
    return APIResponse(data=escalation, message="Escalation updated")
