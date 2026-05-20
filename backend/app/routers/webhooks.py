"""Webhooks router — Shopify webhook handlers."""

from fastapi import APIRouter, Request, HTTPException
from app.config import settings
from app.utils.helpers import verify_shopify_hmac

router = APIRouter()


@router.post("/shopify")
async def shopify_webhook(request: Request):
    """Handle incoming Shopify webhooks (order events).

    Shopify sends webhooks for events like:
    - orders/create
    - orders/updated
    - orders/cancelled
    - refunds/create

    The webhook payload is verified via HMAC-SHA256.
    """
    # Get raw body for HMAC verification
    body = await request.body()

    # Verify HMAC signature if webhook secret is configured
    if settings.shopify_webhook_secret and not settings.shopify_webhook_secret.startswith("your"):
        hmac_header = request.headers.get("X-Shopify-Hmac-SHA256", "")
        if not verify_shopify_hmac(body, hmac_header, settings.shopify_webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # Get the webhook topic
    topic = request.headers.get("X-Shopify-Topic", "unknown")

    # Parse the payload
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    # Handle different webhook topics
    if topic == "orders/create":
        print(f"[ORDER] New order webhook received: {payload.get('id', 'unknown')}")
    elif topic == "orders/updated":
        print(f"[UPDATE] Order updated webhook: {payload.get('id', 'unknown')}")
    elif topic == "orders/cancelled":
        print(f"[CANCEL] Order cancelled webhook: {payload.get('id', 'unknown')}")
    elif topic == "refunds/create":
        print(f"[REFUND] Refund created webhook: {payload.get('id', 'unknown')}")
    else:
        print(f"[WEBHOOK] Webhook received -- Topic: {topic}")

    return {"status": "received", "topic": topic}
