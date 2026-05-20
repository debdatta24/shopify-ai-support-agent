# CommerceMind AI — Backend

AI-powered ecommerce customer support backend built with FastAPI, OpenAI, and Shopify integration.

## Features

- 🤖 **AI Chat Agent** — OpenAI-powered with function calling (track orders, process refunds, escalate)
- 📦 **Order Tracking** — Shopify API integration with mock data fallback
- 💰 **Refund Workflows** — State machine (pending → under_review → approved/rejected → completed)
- 🔺 **Escalation System** — Priority-based routing with audit logs
- 💬 **Chat Memory** — Per-session sliding window conversation history
- 🔗 **Shopify Webhooks** — HMAC-verified webhook handlers

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your API keys (optional — app works with mock data)

# Run the server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send a message to the AI agent |
| GET | `/api/chat/history/{session_id}` | Get conversation history |
| DELETE | `/api/chat/history/{session_id}` | Clear a session |
| GET | `/api/chat/sessions` | List active sessions |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (search, filter by status) |
| GET | `/api/orders/{order_id}` | Get order details with timeline |

### Refunds
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/refunds` | Create a refund request |
| GET | `/api/refunds` | List refund requests |
| GET | `/api/refunds/{refund_id}` | Get refund details |
| PATCH | `/api/refunds/{refund_id}` | Update refund status |

### Escalations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/escalations` | Create an escalation |
| GET | `/api/escalations` | List escalations (filter by priority/status) |
| GET | `/api/escalations/{id}` | Get escalation with audit log |
| PATCH | `/api/escalations/{id}` | Update status/assignment |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/shopify` | Shopify order event webhooks |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key (mock responses if missing) |
| `SHOPIFY_STORE_URL` | No | Shopify store URL (mock data if missing) |
| `SHOPIFY_ACCESS_TOKEN` | No | Shopify admin API token |
| `SHOPIFY_WEBHOOK_SECRET` | No | Webhook HMAC verification secret |
| `AI_MODEL` | No | OpenAI model (default: gpt-4o-mini) |
| `CORS_ORIGINS` | No | Allowed origins (default: localhost:3000) |

## Architecture

```
app/
├── main.py              # FastAPI entry point
├── config.py            # Settings from .env
├── dependencies.py      # Service DI
├── models/              # Pydantic schemas
├── routers/             # API route handlers
├── services/            # Business logic
│   ├── ai_agent.py      # OpenAI function-calling agent
│   ├── shopify_service.py  # Shopify API client
│   ├── refund_service.py   # Refund state machine
│   ├── escalation_service.py  # Escalation routing
│   └── memory_service.py  # Chat memory store
└── utils/               # Helpers
```
