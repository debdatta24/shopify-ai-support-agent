# Product Requirements Document (PRD) — CommerceMind-AI

## 1. Product Vision & Value Proposition
CommerceMind-AI is an intelligent, AI-first customer support platform designed specifically for Shopify merchants. By blending advanced large language model (LLM) orchestration with reliable, deterministic e-commerce actions, CommerceMind-AI reduces human ticket load by automating up to 70% of standard customer inquiries (order tracking, return policies, refund requests) while providing support agents with a modern, glassmorphic workspace to manage complex escalations.

---

## 2. Problem Statement & Target Audience

### The Problem
*   **High Ticket Volume**: E-commerce support teams spend 60%+ of their time resolving repetitive queries ("Where is my order?" or "How do I return this?").
*   **Fragmented Tooling**: Agents constantly switch tabs between chat widgets, Shopify admin portals, and internal ticketing boards.
*   **Poor AI Trust**: Traditional chatbots are either too rigid (rule-based tree flows) or too unpredictable (hallucinating order numbers).

### Target Audience
1.  **E-commerce Shoppers**: Seek instant, 24/7 updates on order status, returns, and policy details.
2.  **Support Agents**: Need a clean workspace to manage high-priority tickets, view audit trails, and approve refunds.
3.  **Store Owners / Managers**: Require visibility into support performance, refund volumes, and AI resolution rates.

---

## 3. Core Features & User Journeys

### Feature 1: Intelligent Customer Chatbot (AI-First)
*   **Description**: A customer-facing conversational interface powered by `gpt-4o-mini` with real-time Shopify tool integration.
*   **User Journey**: 
    1.  Customer opens chat and asks, *"Where is my package? My email is emily@example.com."*
    2.  AI executes `search_orders` and `track_order` tools to query live status.
    3.  AI presents the tracking timeline and delivery window dynamically.
*   **Functional Requirements**:
    *   Dynamic typing indicator.
    *   Suggested reply chips (e.g., "Track Order", "Policy Help").
    *   Context preservation up to 50 turns.

### Feature 2: Orders Tracking & Status Center (Admin)
*   **Description**: A centralized list pane to review, search, and inspect order histories.
*   **User Journey**:
    1.  Agent navigates to `/orders` to check on a customer request.
    2.  Agent inputs name or order ID; list filters in real-time.
    3.  Clicking an order reveals detailed items, shipping address, and a vertical visual status timeline.

### Feature 3: Smart Refund Management System
*   **Description**: A standardized request wizard and manager that applies business guardrails to refunds.
*   **User Journey**:
    1.  Customer requests a refund in chat, or agent uses the refund wizard in the dashboard.
    2.  If the refund amount is **over $500**, the system automatically tags it as `UNDER_REVIEW` and routes it to escalations.
    3.  If the refund is **under $500**, it proceeds to approval.
*   **State Rules**:
    *   Transitions are locked programmatically: `PENDING` ➔ `UNDER_REVIEW` ➔ `APPROVED` ➔ `COMPLETED`.
    *   Cancelled or non-delivered orders are flagged before processing.

### Feature 4: Human-in-the-Loop Escalation Queue
*   **Description**: A priority-based routing queue for handling high-friction or high-value issues.
*   **User Journey**:
    1.  AI agent detects high frustration or processes a large refund and triggers an escalation.
    2.  The system categorizes priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and assigns it to specific groups.
    3.  Agents handle tickets, add notes, update statuses, and log every event in a permanent audit trail.

---

## 4. Key Performance Indicators (KPIs)
To measure the platform's efficiency, the dashboard tracks:
*   **AI Resolution Rate**: Percentage of conversations solved without human handoff.
*   **Average Response Time (ART)**: Time taken to reply to escalated issues.
*   **Refund Processing Velocity**: Average duration from refund request to completion.
*   **Ticket Volume by Priority**: Breakdown of active escalations (`CRITICAL` vs. `LOW`).

---

## 5. Product Release Roadmap

```
┌────────────────────────────────────────┐
│ PHASE 1: Interactive Prototype (Current)│
├────────────────────────────────────────┤
│ • Dark mode design system (Glass)       │
│ • Local mock-data fallback systems     │
│ • State machines for refunds/tickets   │
│ • Real-time AI chat with mock tools    │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ PHASE 2: Live Integrations (Target)    │
├────────────────────────────────────────┤
│ • Connect real Shopify Sandbox Client  │
│ • Correct Webhook HMAC verification    │
│ • Persistent DB (PostgreSQL + Redis)   │
│ • Real-time notifications via WebSockets│
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ PHASE 3: Production Ready & Analytics  │
├────────────────────────────────────────┤
│ • User Authentication & RBAC           │
│ • Live Stripe/Shopify Gateway Refunds  │
│ • Agent Workspace Collaboration Tools   │
│ • Advanced Sentiment Dashboards        │
└────────────────────────────────────────┘
```
