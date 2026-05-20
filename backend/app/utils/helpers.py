"""Utility helpers for the CommerceMind AI backend."""

import uuid
import hmac
import hashlib
from datetime import datetime, timezone


def generate_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix."""
    short_id = uuid.uuid4().hex[:8].upper()
    return f"{prefix}{short_id}" if prefix else short_id


def now_iso() -> str:
    """Get current UTC timestamp in ISO format."""
    return datetime.now(timezone.utc).isoformat()


def format_timestamp(iso_str: str) -> str:
    """Format an ISO timestamp to a human-readable string."""
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%b %d, %Y %I:%M %p")
    except (ValueError, AttributeError):
        return iso_str


def verify_shopify_hmac(data: bytes, hmac_header: str, secret: str) -> bool:
    """Verify Shopify webhook HMAC signature."""
    computed = hmac.new(
        secret.encode("utf-8"),
        data,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(computed, hmac_header)


def format_currency(amount: float) -> str:
    """Format a number as USD currency."""
    return f"${amount:,.2f}"
