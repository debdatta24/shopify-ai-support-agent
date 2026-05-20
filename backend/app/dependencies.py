"""Dependency injection for services."""

from app.services.memory_service import MemoryService
from app.services.shopify_service import ShopifyService
from app.services.refund_service import RefundService
from app.services.escalation_service import EscalationService
from app.services.ai_agent import AIAgent

# Singleton service instances
memory_service = MemoryService()
shopify_service = ShopifyService()
refund_service = RefundService()
escalation_service = EscalationService()
ai_agent = AIAgent(
    memory_service=memory_service,
    shopify_service=shopify_service,
    refund_service=refund_service,
    escalation_service=escalation_service,
)


def get_memory_service() -> MemoryService:
    return memory_service


def get_shopify_service() -> ShopifyService:
    return shopify_service


def get_refund_service() -> RefundService:
    return refund_service


def get_escalation_service() -> EscalationService:
    return escalation_service


def get_ai_agent() -> AIAgent:
    return ai_agent
