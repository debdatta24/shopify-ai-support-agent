"""Shopify API client with mock data fallback."""

from typing import Optional, List
import httpx

from app.config import settings
from app.models.order import Order, OrderItem, OrderStatus, TimelineEvent
from app.utils.helpers import generate_id


# ===== Mock Data (used when Shopify credentials are not configured) =====
MOCK_ORDERS: List[Order] = [
    Order(
        id="ORD-7829", customer_name="Sarah Mitchell", customer_email="sarah.m@email.com",
        items=[
            OrderItem(id="itm-1", name="Wireless Noise-Cancelling Headphones", quantity=1, price=199.99),
            OrderItem(id="itm-2", name="USB-C Charging Cable", quantity=2, price=14.99),
        ],
        total=229.97, status=OrderStatus.PROCESSING,
        created_at="2026-05-19T10:30:00Z", updated_at="2026-05-19T10:30:00Z",
        shipping_address="742 Evergreen Terrace, Springfield, IL 62704",
        timeline=[
            TimelineEvent(status="Order Placed", description="Order confirmed and payment received", timestamp="2026-05-19T10:30:00Z", completed=True),
            TimelineEvent(status="Processing", description="Order is being prepared", timestamp="2026-05-19T11:00:00Z", completed=True),
            TimelineEvent(status="Shipped", description="Package handed to carrier", timestamp="", completed=False),
            TimelineEvent(status="Delivered", description="Package delivered", timestamp="", completed=False),
        ],
    ),
    Order(
        id="ORD-7825", customer_name="James Wilson", customer_email="j.wilson@email.com",
        items=[OrderItem(id="itm-3", name="Ergonomic Office Chair", quantity=1, price=449.00)],
        total=449.0, status=OrderStatus.DELIVERED,
        created_at="2026-05-17T14:20:00Z", updated_at="2026-05-19T09:15:00Z",
        tracking_number="1Z999AA10123456784",
        shipping_address="1600 Pennsylvania Avenue NW, Washington, DC 20500",
        timeline=[
            TimelineEvent(status="Order Placed", description="Order confirmed", timestamp="2026-05-17T14:20:00Z", completed=True),
            TimelineEvent(status="Processing", description="Order is being prepared", timestamp="2026-05-17T16:00:00Z", completed=True),
            TimelineEvent(status="Shipped", description="Package handed to carrier", timestamp="2026-05-18T08:30:00Z", completed=True),
            TimelineEvent(status="Delivered", description="Package delivered", timestamp="2026-05-19T09:15:00Z", completed=True),
        ],
    ),
    Order(
        id="ORD-7820", customer_name="Emily Chen", customer_email="emily.c@email.com",
        items=[
            OrderItem(id="itm-4", name="Smart Watch Pro", quantity=1, price=329.99),
            OrderItem(id="itm-5", name="Watch Band - Midnight Blue", quantity=1, price=49.99),
        ],
        total=392.97, status=OrderStatus.SHIPPED,
        created_at="2026-05-16T09:45:00Z", updated_at="2026-05-18T11:00:00Z",
        tracking_number="9400111899223100001",
        shipping_address="350 Fifth Avenue, New York, NY 10118",
        timeline=[
            TimelineEvent(status="Order Placed", description="Order confirmed", timestamp="2026-05-16T09:45:00Z", completed=True),
            TimelineEvent(status="Processing", description="Order is being prepared", timestamp="2026-05-16T12:00:00Z", completed=True),
            TimelineEvent(status="Shipped", description="Package handed to carrier", timestamp="2026-05-18T11:00:00Z", completed=True),
            TimelineEvent(status="Delivered", description="Package delivered", timestamp="", completed=False),
        ],
    ),
    Order(
        id="ORD-7818", customer_name="David Park", customer_email="d.park@email.com",
        items=[OrderItem(id="itm-7", name='4K Gaming Monitor 27"', quantity=1, price=599.99)],
        total=599.99, status=OrderStatus.CONFIRMED,
        created_at="2026-05-19T08:00:00Z", updated_at="2026-05-19T08:30:00Z",
        shipping_address="221B Baker Street, London, UK",
        timeline=[
            TimelineEvent(status="Order Placed", description="Order confirmed", timestamp="2026-05-19T08:00:00Z", completed=True),
            TimelineEvent(status="Processing", description="Order is being prepared", timestamp="", completed=False),
            TimelineEvent(status="Shipped", description="Package handed to carrier", timestamp="", completed=False),
            TimelineEvent(status="Delivered", description="Package delivered", timestamp="", completed=False),
        ],
    ),
    Order(
        id="ORD-7815", customer_name="Alex Thompson", customer_email="alex.t@email.com",
        items=[
            OrderItem(id="itm-8", name="Mechanical Keyboard RGB", quantity=1, price=159.99),
            OrderItem(id="itm-9", name="Wrist Rest Pad", quantity=1, price=24.99),
        ],
        total=184.98, status=OrderStatus.CANCELLED,
        created_at="2026-05-15T16:30:00Z", updated_at="2026-05-16T10:00:00Z",
        shipping_address="10 Downing Street, Westminster, London",
        timeline=[
            TimelineEvent(status="Order Placed", description="Order confirmed", timestamp="2026-05-15T16:30:00Z", completed=True),
            TimelineEvent(status="Cancelled", description="Customer requested cancellation", timestamp="2026-05-16T10:00:00Z", completed=True),
        ],
    ),
    Order(
        id="ORD-7810", customer_name="Maria Garcia", customer_email="m.garcia@email.com",
        items=[OrderItem(id="itm-10", name="Bluetooth Speaker", quantity=2, price=79.99)],
        total=159.98, status=OrderStatus.OUT_FOR_DELIVERY,
        created_at="2026-05-14T11:20:00Z", updated_at="2026-05-19T06:45:00Z",
        tracking_number="7489201345678",
        shipping_address="8 Rue de Rivoli, 75001 Paris, France",
        timeline=[
            TimelineEvent(status="Order Placed", description="Order confirmed", timestamp="2026-05-14T11:20:00Z", completed=True),
            TimelineEvent(status="Processing", description="Order is being prepared", timestamp="2026-05-14T14:00:00Z", completed=True),
            TimelineEvent(status="Shipped", description="Package handed to carrier", timestamp="2026-05-16T09:00:00Z", completed=True),
            TimelineEvent(status="Out for Delivery", description="Package is on its way", timestamp="2026-05-19T06:45:00Z", completed=True),
            TimelineEvent(status="Delivered", description="Package delivered", timestamp="", completed=False),
        ],
    ),
]


class ShopifyService:
    """Shopify API client. Falls back to mock data when credentials are missing."""

    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
        if settings.has_shopify:
            self._client = httpx.AsyncClient(
                base_url=f"{settings.shopify_store_url}/admin/api/2024-01",
                headers={
                    "X-Shopify-Access-Token": settings.shopify_access_token,
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )

    @property
    def is_live(self) -> bool:
        return self._client is not None

    async def get_orders(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Order]:
        """Get orders, optionally filtered by search term and status."""
        if not self.is_live:
            return self._filter_mock_orders(search, status)

        # Live Shopify API call
        params = {"limit": 50, "status": "any"}
        resp = await self._client.get("/orders.json", params=params)
        resp.raise_for_status()
        data = resp.json()
        return [self._map_shopify_order(o) for o in data.get("orders", [])]

    async def get_order(self, order_id: str) -> Optional[Order]:
        """Get a single order by ID."""
        if not self.is_live:
            return next((o for o in MOCK_ORDERS if o.id == order_id), None)

        try:
            resp = await self._client.get(f"/orders/{order_id}.json")
            resp.raise_for_status()
            return self._map_shopify_order(resp.json()["order"])
        except httpx.HTTPStatusError:
            return None

    async def create_refund(self, order_id: str, amount: float) -> dict:
        """Create a refund for an order via Shopify API."""
        if not self.is_live:
            return {"success": True, "refund_id": generate_id("SRF-"), "amount": amount, "mock": True}

        payload = {
            "refund": {
                "note": "Refund processed via CommerceMind AI",
                "shipping": {"full_refund": True},
                "transactions": [{"kind": "refund", "amount": amount}],
            }
        }
        resp = await self._client.post(f"/orders/{order_id}/refunds.json", json=payload)
        resp.raise_for_status()
        return resp.json()

    def _filter_mock_orders(self, search: Optional[str], status: Optional[str]) -> List[Order]:
        """Filter mock orders by search and status."""
        orders = MOCK_ORDERS
        if search:
            s = search.lower()
            orders = [o for o in orders if s in o.id.lower() or s in o.customer_name.lower()]
        if status and status != "all":
            orders = [o for o in orders if o.status == status]
        return orders

    def _map_shopify_order(self, shopify_order: dict) -> Order:
        """Map a Shopify API order response to our Order model."""
        items = [
            OrderItem(
                id=str(li["id"]),
                name=li["title"],
                quantity=li["quantity"],
                price=float(li["price"]),
            )
            for li in shopify_order.get("line_items", [])
        ]

        status_map = {
            "pending": OrderStatus.PROCESSING,
            "authorized": OrderStatus.CONFIRMED,
            "paid": OrderStatus.CONFIRMED,
            "partially_refunded": OrderStatus.DELIVERED,
            "refunded": OrderStatus.RETURNED,
            "voided": OrderStatus.CANCELLED,
        }

        return Order(
            id=str(shopify_order["id"]),
            customer_name=shopify_order.get("customer", {}).get("first_name", "Unknown")
                          + " "
                          + shopify_order.get("customer", {}).get("last_name", ""),
            customer_email=shopify_order.get("customer", {}).get("email", ""),
            items=items,
            total=float(shopify_order.get("total_price", 0)),
            status=status_map.get(shopify_order.get("financial_status", ""), OrderStatus.PROCESSING),
            created_at=shopify_order.get("created_at", ""),
            updated_at=shopify_order.get("updated_at", ""),
            shipping_address=self._format_address(shopify_order.get("shipping_address", {})),
            timeline=[],
        )

    def _format_address(self, addr: dict) -> str:
        """Format a Shopify address dict to a string."""
        parts = [addr.get("address1", ""), addr.get("city", ""), addr.get("province", ""), addr.get("zip", ""), addr.get("country", "")]
        return ", ".join(p for p in parts if p)
