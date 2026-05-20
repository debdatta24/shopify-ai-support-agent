"""Orders router — order tracking and details."""

from fastapi import APIRouter, Depends, Query
from typing import Optional, List

from app.dependencies import get_shopify_service
from app.services.shopify_service import ShopifyService
from app.models.order import Order
from app.models.common import APIResponse

router = APIRouter()


@router.get("", response_model=APIResponse[List[Order]])
async def list_orders(
    search: Optional[str] = Query(None, description="Search by order ID or customer name"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    shopify: ShopifyService = Depends(get_shopify_service),
):
    """List all orders with optional search and status filter."""
    orders = await shopify.get_orders(search=search, status=status)
    return APIResponse(data=orders, message=f"{len(orders)} orders found")


@router.get("/{order_id}", response_model=APIResponse[Order])
async def get_order(
    order_id: str,
    shopify: ShopifyService = Depends(get_shopify_service),
):
    """Get a single order by ID with full details and timeline."""
    order = await shopify.get_order(order_id)
    if not order:
        return APIResponse(success=False, error="Order not found", message=f"No order found with ID {order_id}")
    return APIResponse(data=order)
