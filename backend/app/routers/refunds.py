"""Refunds router — CRUD operations for refund requests."""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List

from app.dependencies import get_refund_service, get_shopify_service, get_escalation_service
from app.services.refund_service import RefundService
from app.services.shopify_service import ShopifyService
from app.services.escalation_service import EscalationService
from app.models.refund import RefundRequest, RefundCreate, RefundUpdate
from app.models.escalation import EscalationCreate, EscalationPriority
from app.models.common import APIResponse
from app.utils.helpers import format_currency

router = APIRouter()


@router.post("", response_model=APIResponse[RefundRequest])
async def create_refund(
    data: RefundCreate,
    refund_svc: RefundService = Depends(get_refund_service),
    shopify: ShopifyService = Depends(get_shopify_service),
    esc_svc: EscalationService = Depends(get_escalation_service),
):
    """Create a new refund request. Auto-escalates high-value refunds."""
    # Get order info
    order = await shopify.get_order(data.order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {data.order_id} not found")

    if order.status.value == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot refund a cancelled order")

    # Create the refund
    refund = refund_svc.create_refund(data, order.customer_name, order.total)

    # Auto-escalate high-value refunds
    if refund_svc.should_auto_escalate(refund):
        esc = esc_svc.create_escalation(
            EscalationCreate(
                customer_name=order.customer_name,
                subject=f"High-value refund: {format_currency(refund.amount)}",
                description=f"Auto-escalated refund {refund.id} for order {order.id}. Amount: {format_currency(refund.amount)}. Reason: {refund.reason.value}.",
                priority=EscalationPriority.HIGH,
            )
        )
        refund.escalation_id = esc.id

    return APIResponse(data=refund, message="Refund request created")


@router.get("", response_model=APIResponse[List[RefundRequest]])
async def list_refunds(
    status: Optional[str] = Query(None, description="Filter by refund status"),
    order_id: Optional[str] = Query(None, description="Filter by order ID"),
    refund_svc: RefundService = Depends(get_refund_service),
):
    """List all refund requests with optional filters."""
    refunds = refund_svc.list_refunds(status=status, order_id=order_id)
    return APIResponse(data=refunds, message=f"{len(refunds)} refunds found")


@router.get("/{refund_id}", response_model=APIResponse[RefundRequest])
async def get_refund(
    refund_id: str,
    refund_svc: RefundService = Depends(get_refund_service),
):
    """Get a refund request by ID."""
    refund = refund_svc.get_refund(refund_id)
    if not refund:
        raise HTTPException(status_code=404, detail=f"Refund {refund_id} not found")
    return APIResponse(data=refund)


@router.patch("/{refund_id}", response_model=APIResponse[RefundRequest])
async def update_refund(
    refund_id: str,
    update: RefundUpdate,
    refund_svc: RefundService = Depends(get_refund_service),
):
    """Update a refund request's status."""
    try:
        refund = refund_svc.update_status(refund_id, update)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not refund:
        raise HTTPException(status_code=404, detail=f"Refund {refund_id} not found")
    return APIResponse(data=refund, message="Refund updated")
