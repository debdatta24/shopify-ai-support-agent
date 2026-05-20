# CommerceMind-AI

CommerceMind-AI is an intelligent, AI-powered e-commerce customer support platform designed specifically for Shopify merchants. It combines advanced Large Language Model (LLM) orchestration (using GPT-4o-mini with dynamic tool-calling) with a robust, deterministic e-commerce service layer and a premium, modern dashboard workspace.

This platform automates common inquiries—such as order tracking, refund requests, and policy explanations—while providing support agents with a clean interface to manage complex, priority-based human escalations.

---

## 🌟 Key Features

*   🤖 **AI Customer Chatbot**: Multi-turn support assistant powered by OpenAI function calling. Dynamically tracks orders, initiates refunds, explains policies, and escalates to human agents.
*   📦 **Order Tracking Dashboard**: Real-time order monitoring with a visual vertical status timeline showing fulfillment milestones.
*   💰 **Smart Refund Workflows**: Programmatic refund state machine (Pending ➔ Under Review ➔ Approved ➔ Completed) with automated safety checks and auto-escalation for refunds exceeding $500.
*   🔺 **Human Escalation Queue**: Priority-based ticket routing (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with structured assignment pools and a full cryptographic-style audit log tracking all status transitions.
*   🔗 **Shopify API & Webhooks**: Integrated REST API operations with verified signature handling (`HMAC-SHA256`) for incoming Shopify webhooks.
*   🔄 **Dual-Mode Graceful Degradation**: Independent fallback engines. If OpenAI or Shopify API credentials are missing or down, the system gracefully falls back to local regex keyword analysis and mock databases.

---

## 🛠️ Technology Stack

| Layer | Technologies | Key Role |
|---|---|---|
| **Frontend** | Next.js 16.2 (App Router), React 19, Tailwind CSS v4, TypeScript | Dark mode glassmorphic UI, responsive agent workspace |
| **Backend** | FastAPI, Uvicorn (ASGI), Pydantic Settings, HTTPX | Asynchronous API gateway, Pydantic data validation |
| **AI Layer** | OpenAI SDK (`gpt-4o-mini`), JSON Tool Call Loop | Cognitive intent parsing, entity extraction, tool dispatching |
| **Shopify** | Shopify Admin REST API (`2024-01`), Webhook HMAC | Store inventory, order fulfillment, and transaction syncing |

---

## 📁 Project Structure

```
CommerceMind-AI/
├── backend/                  # FastAPI ASGI Application
│   ├── app/
│   │   ├── main.py           # API Entry Point & Router Mounting
│   │   ├── config.py         # Env Config validation via Pydantic
│   │   ├── dependencies.py   # Dependency injection container
│   │   ├── models/           # Domain Pydantic validation schemas
│   │   ├── routers/          # API Endpoint Controllers (REST + Webhooks)
│   │   ├── services/         # Core Business Logic (AI, Shopify, Refunds, Tickets)
│   │   └── utils/            # Cryptographic verifications & helper logic
│   ├── requirements.txt      # Python package dependencies
│   └── .env.example          # Backend environment template
│
├── frontend/                 # Next.js Web App
│   ├── src/
│   │   ├── app/              # Page layouts & router views (Chat, Orders, etc.)
│   │   ├── components/       # Shared UI components (StatCard, Sidebar, Timeline)
│   │   └── lib/              # TypeScript typings and local fallback datasets
│   ├── package.json          # Node script commands & configurations
│   └── globals.css           # Styling system & custom glassmorphism overrides
│
└── docs/                     # Comprehensive Project Documentation
    ├── product_document.md   # Product Requirements Document (PRD)
    ├── technical_document.md # Technical Architecture Specification
    └── engineering_decision_log.md # Architecture Decision Records (ADRs)
```

---

## 🚀 Setup & Installation

### Prerequisites

Ensure you have the following installed on your machine:
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Node.js 18+](https://nodejs.org/)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    *   **Windows (PowerShell)**:
        ```powershell
        python -m venv venv
        .\venv\Scripts\Activate.ps1
        ```
    *   **macOS / Linux**:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
3.  Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure the environment variables:
    ```bash
    cp .env.example .env
    ```
    Open `.env` in your editor and configure your secrets. If you leave the fields blank, the system will run securely in **offline fallback mode** using mock data and local heuristics:
    ```env
    OPENAI_API_KEY=sk-your-openai-key-here
    SHOPIFY_STORE_URL=https://your-store.myshopify.com
    SHOPIFY_ACCESS_TOKEN=shpat_your-access-token-here
    SHOPIFY_WEBHOOK_SECRET=your-webhook-secret-here
    CORS_ORIGINS=http://localhost:3000,http://localhost:3001
    ```
5.  Start the FastAPI development server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
    The server will spin up on `http://localhost:8000`. You can access interactive API docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install npm dependencies:
    ```bash
    npm install
    ```
3.  Start the Next.js dev server:
    ```bash
    npm run dev
    ```
    The app will start on `http://localhost:3000`. Open this address in your browser to view the client dashboard workspace.

---

## 🛡️ Webhook Verification

To test incoming webhook integrations locally, you can send simulated JSON POST requests to `/api/webhooks/shopify`. The server expects the payload signature in the `X-Shopify-Hmac-SHA256` header:

```bash
X-Shopify-Hmac-SHA256: [Computed HMAC-SHA256 Signature]
X-Shopify-Topic: orders/create
```
*(Refer to the [Technical Specification](docs/technical_document.md#11-security-considerations) for security implementation details.)*

---

## 📖 Additional Documentation

For more detail, inspect the markdown specification documents inside the `docs/` folder:
*   [Product Requirements Document (PRD)](docs/product_document.md)
*   [Technical Architecture Specification](docs/technical_document.md)
*   [Architecture Decision Record Log (ADRs)](docs/engineering_decision_log.md)

Demo Video Link: https://drive.google.com/file/d/14jC2YRWs5jdmnhhHXBJhzWz2AKy_4qF1/view?usp=sharing
