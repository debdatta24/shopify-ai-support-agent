"""OpenAI-powered AI agent with function calling for ecommerce support."""

import json
from typing import Optional, List
from datetime import datetime, timezone

from app.config import settings
from app.models.chat import ChatMessage
from app.models.refund import RefundCreate, RefundReason
from app.models.escalation import EscalationCreate, EscalationPriority
from app.utils.helpers import generate_id, now_iso, format_currency

# Conditional OpenAI import
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None


SYSTEM_PROMPT = """You are CommerceMind AI, a friendly and professional customer support agent for an ecommerce store.

Your capabilities:
1. **Track Orders** — Look up order status, tracking info, and delivery estimates
2. **Process Refunds** — Help customers submit refund requests with proper reason codes
3. **Escalate Issues** — Route complex or sensitive issues to human agents
4. **Answer Questions** — Provide helpful answers about products, policies, and shipping

Guidelines:
- Be warm, empathetic, and professional
- Use emojis sparingly for friendliness (✅, 📦, 🔍, etc.)
- Always confirm actions before taking them
- For refunds >$500, mention that it will require manager approval
- If you can't resolve an issue, offer to escalate to a human agent
- Keep responses concise but thorough
- Format lists and important info clearly

Available tools:
- track_order: Look up order details and status
- process_refund: Submit a refund request
- escalate_to_human: Escalate to a human agent
- get_order_details: Get full order information
"""

# OpenAI function definitions for tool calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "track_order",
            "description": "Track an order by its order ID. Returns current status, tracking number, and timeline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order ID (e.g., ORD-7829)",
                    }
                },
                "required": ["order_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "process_refund",
            "description": "Submit a refund request for a customer order.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order ID to refund",
                    },
                    "reason": {
                        "type": "string",
                        "enum": ["defective", "wrong_item", "not_as_described", "arrived_late", "changed_mind", "other"],
                        "description": "Reason for the refund",
                    },
                    "description": {
                        "type": "string",
                        "description": "Customer's description of the issue",
                    },
                },
                "required": ["order_id", "reason", "description"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "escalate_to_human",
            "description": "Escalate the conversation to a human agent when the AI cannot resolve the issue.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {
                        "type": "string",
                        "description": "The customer's name",
                    },
                    "subject": {
                        "type": "string",
                        "description": "Brief subject of the escalation",
                    },
                    "description": {
                        "type": "string",
                        "description": "Detailed description of the issue",
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["critical", "high", "medium", "low"],
                        "description": "Priority level",
                    },
                },
                "required": ["customer_name", "subject", "description", "priority"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_order_details",
            "description": "Get full details for an order including items, shipping address, and timeline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order ID",
                    }
                },
                "required": ["order_id"],
            },
        },
    },
]


MOCK_RESPONSES = [
    "I'd be happy to help you with that! Let me look into it right away. 🔍\n\nBased on our records, your request has been processed. Is there anything else I can assist you with?",
    "Great question! Here's what I found:\n\n📋 Your order is being handled by our team\n✅ Everything looks good on our end\n\nWould you like me to provide more details?",
    "I understand your concern. Let me help resolve this for you.\n\nI've checked our system and here's the update:\n• Your request has been noted\n• Our team will follow up within 24 hours\n\nIs there anything else you'd like to know?",
    "Absolutely! I've taken care of that for you. Here's the summary:\n\n🔄 Request processed successfully\n📅 Updated just now\n⏱️ Expected resolution: Within 1 business day\n\nFeel free to ask if you need anything else!",
]


class AIAgent:
    """AI agent powered by OpenAI with function calling."""

    def __init__(self, memory_service, shopify_service, refund_service, escalation_service):
        self.memory = memory_service
        self.shopify = shopify_service
        self.refunds = refund_service
        self.escalations = escalation_service
        self._client = None
        self._mock_index = 0

        if settings.has_openai and AsyncOpenAI:
            self._client = AsyncOpenAI(api_key=settings.openai_api_key)

    @property
    def is_live(self) -> bool:
        return self._client is not None

    async def chat(self, session_id: str, user_message: str) -> ChatMessage:
        """Process a user message and return an AI response."""
        # Store user message
        user_msg = ChatMessage(
            id=generate_id("msg-"),
            content=user_message,
            sender="user",
            timestamp=now_iso(),
        )
        self.memory.add_message(session_id, user_msg)

        # Generate response
        if self.is_live:
            response_content, tool_calls = await self._openai_chat(session_id)
        else:
            response_content = self._mock_response(user_message)
            tool_calls = None

        # Store AI response
        ai_msg = ChatMessage(
            id=generate_id("msg-"),
            content=response_content,
            sender="ai",
            timestamp=now_iso(),
            metadata={"tool_calls": tool_calls} if tool_calls else None,
        )
        self.memory.add_message(session_id, ai_msg)

        return ai_msg

    async def _openai_chat(self, session_id: str) -> tuple:
        """Make an OpenAI API call with function calling."""
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        messages.extend(self.memory.get_messages_for_openai(session_id))

        try:
            response = await self._client.chat.completions.create(
                model=settings.ai_model,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                max_tokens=settings.ai_max_tokens,
                temperature=settings.ai_temperature,
            )

            choice = response.choices[0]
            tool_calls_made = []

            # Handle tool calls
            if choice.message.tool_calls:
                for tool_call in choice.message.tool_calls:
                    fn_name = tool_call.function.name
                    fn_args = json.loads(tool_call.function.arguments)
                    result = await self._execute_tool(fn_name, fn_args)
                    tool_calls_made.append({
                        "function": fn_name,
                        "arguments": fn_args,
                        "result": result,
                    })

                    # Add tool results to conversation and get follow-up
                    messages.append(choice.message.model_dump())
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(result),
                    })

                # Get final response after tool execution
                follow_up = await self._client.chat.completions.create(
                    model=settings.ai_model,
                    messages=messages,
                    max_tokens=settings.ai_max_tokens,
                    temperature=settings.ai_temperature,
                )
                content = follow_up.choices[0].message.content or "I've completed the requested action."
                return content, tool_calls_made

            return choice.message.content or "I'm here to help!", None

        except Exception as e:
            print(f"OpenAI API error: {e}")
            return f"I apologize, but I'm experiencing a technical issue. Please try again or let me escalate this to a human agent. Error: {str(e)[:100]}", None

    async def _execute_tool(self, function_name: str, arguments: dict) -> dict:
        """Execute a tool call and return results."""
        try:
            if function_name == "track_order":
                return await self._tool_track_order(arguments["order_id"])
            elif function_name == "get_order_details":
                return await self._tool_get_order_details(arguments["order_id"])
            elif function_name == "process_refund":
                return await self._tool_process_refund(arguments)
            elif function_name == "escalate_to_human":
                return self._tool_escalate(arguments)
            else:
                return {"error": f"Unknown function: {function_name}"}
        except Exception as e:
            return {"error": str(e)}

    async def _tool_track_order(self, order_id: str) -> dict:
        """Tool: Track an order."""
        order = await self.shopify.get_order(order_id)
        if not order:
            return {"error": f"Order {order_id} not found"}

        return {
            "order_id": order.id,
            "status": order.status.value,
            "customer": order.customer_name,
            "total": format_currency(order.total),
            "tracking_number": order.tracking_number or "Not yet available",
            "shipping_address": order.shipping_address,
            "created_at": order.created_at,
            "timeline": [
                {"status": e.status, "completed": e.completed, "timestamp": e.timestamp}
                for e in order.timeline
            ],
        }

    async def _tool_get_order_details(self, order_id: str) -> dict:
        """Tool: Get full order details."""
        order = await self.shopify.get_order(order_id)
        if not order:
            return {"error": f"Order {order_id} not found"}

        return {
            "order_id": order.id,
            "customer": order.customer_name,
            "email": order.customer_email,
            "status": order.status.value,
            "total": format_currency(order.total),
            "items": [
                {"name": item.name, "qty": item.quantity, "price": format_currency(item.price)}
                for item in order.items
            ],
            "shipping_address": order.shipping_address,
            "tracking_number": order.tracking_number or "Not yet available",
        }

    async def _tool_process_refund(self, args: dict) -> dict:
        """Tool: Process a refund request."""
        order = await self.shopify.get_order(args["order_id"])
        if not order:
            return {"error": f"Order {args['order_id']} not found"}

        if order.status == "cancelled":
            return {"error": "Cannot refund a cancelled order"}

        refund_data = RefundCreate(
            order_id=args["order_id"],
            reason=RefundReason(args["reason"]),
            description=args["description"],
        )

        refund = self.refunds.create_refund(refund_data, order.customer_name, order.total)

        result = {
            "refund_id": refund.id,
            "order_id": refund.order_id,
            "amount": format_currency(refund.amount),
            "status": refund.status.value,
            "message": "Refund request submitted successfully",
        }

        # Auto-escalate high-value refunds
        if self.refunds.should_auto_escalate(refund):
            esc = self.escalations.create_escalation(
                EscalationCreate(
                    customer_name=order.customer_name,
                    subject=f"High-value refund: {format_currency(refund.amount)}",
                    description=f"Auto-escalated refund {refund.id} for order {order.id}. Amount: {format_currency(refund.amount)}. Reason: {refund.reason.value}",
                    priority=EscalationPriority.HIGH,
                )
            )
            refund.escalation_id = esc.id
            result["escalation_id"] = esc.id
            result["note"] = "This refund has been auto-escalated for manager approval due to the high amount."

        return result

    def _tool_escalate(self, args: dict) -> dict:
        """Tool: Escalate to human agent."""
        esc = self.escalations.create_escalation(
            EscalationCreate(
                customer_name=args["customer_name"],
                subject=args["subject"],
                description=args["description"],
                priority=EscalationPriority(args["priority"]),
            )
        )

        return {
            "escalation_id": esc.id,
            "ticket_id": esc.ticket_id,
            "assigned_to": esc.assigned_to,
            "priority": esc.priority.value,
            "message": f"Your issue has been escalated to {esc.assigned_to}. Ticket ID: {esc.ticket_id}",
        }

    def _mock_response(self, user_message: str) -> str:
        """Generate a mock response when OpenAI is not configured."""
        msg_lower = user_message.lower()

        # Pattern-matched responses
        if any(kw in msg_lower for kw in ["track", "order", "where", "shipping", "status"]):
            return (
                "I'd be happy to help you track your order! 📦\n\n"
                "I've found your order details:\n"
                "• **Status**: Shipped — currently in transit\n"
                "• **Tracking**: Package is being delivered by our carrier\n"
                "• **Estimated delivery**: Within 2-3 business days\n\n"
                "You'll receive a notification when it's out for delivery. Is there anything else I can help with?"
            )
        elif any(kw in msg_lower for kw in ["refund", "return", "money back"]):
            return (
                "I understand you'd like to request a refund. Let me help with that. 💰\n\n"
                "To process your refund, I'll need:\n"
                "1. Your order number\n"
                "2. The reason for the refund\n"
                "3. A brief description of the issue\n\n"
                "Could you please provide these details?"
            )
        elif any(kw in msg_lower for kw in ["agent", "human", "escalate", "manager", "speak"]):
            return (
                "I'll connect you with a human agent right away. 🎯\n\n"
                "I'm creating an escalation ticket for you now. A member of our support team "
                "will reach out to you within 2 hours.\n\n"
                "Is there anything specific you'd like me to include in the escalation notes?"
            )
        elif any(kw in msg_lower for kw in ["cancel", "cancellation"]):
            return (
                "I can help you with order cancellation. ⚠️\n\n"
                "Please note:\n"
                "• Orders can only be cancelled before they ship\n"
                "• If already shipped, you can request a return instead\n\n"
                "Could you provide your order number so I can check its current status?"
            )
        else:
            response = MOCK_RESPONSES[self._mock_index % len(MOCK_RESPONSES)]
            self._mock_index += 1
            return response
