# CommerceMind-AI — Engineering Decision Log

This log captures the architectural decisions made during the design and construction of the CommerceMind-AI platform, detailing alternatives, rationales, and design trade-offs.

---

## 1. AI Model Selection

*   **Decision**: Adopt `gpt-4o-mini` as the primary orchestration LLM.
*   **Alternatives Considered**:
    *   `gpt-4o`: Offers slightly superior reasoning but at a 15x token cost structure with higher latencies.
    *   `Claude 3.5 Haiku`: Competitive pricing and speed, but function-calling formatting is slightly less reliable with standard OpenAI SDK abstractions.
*   **Rationale**: `gpt-4o-mini` offers the optimal blend of sub-second inference speeds, strong JSON tool-calling performance, and cheap token costs. It easily parses customer intents and extracts entities (like order numbers) without requiring larger, expensive model classes.
*   **Trade-offs**: Marginally less robust in complex multi-step reasoning chains, which we offset by using explicit deterministic system prompt rules and single-turn recursion bounds.

---

## 2. Backend Web Framework

*   **Decision**: FastAPI (Python ASGI) over Django or Flask.
*   **Alternatives Considered**:
    *   `Flask`: Lightweight, but lacks native async/await capabilities and built-in type validation.
    *   `Django`: Features a robust ORM and admin framework, but introduces unnecessary bloat and sluggish cold start times for lightweight APIs.
*   **Rationale**: FastAPI natively supports asynchronous operations (`async/await`), matches modern performance requirements, and automatically generates interactive OpenAPI/Swagger documentation. By leveraging Pydantic, we enforce strict payload schema validation out-of-the-box.
*   **Trade-offs**: Does not provide a built-in admin dashboard or database migrations runner, meaning we have to configure database connection pools and database schemas manually as the app scales.

---

## 3. Shopify Integration Pattern

*   **Decision**: Dual-Mode service wrapper (`shopify_service.py`) supporting both live `httpx` asynchronous calls and local static mock state.
*   **Alternatives Considered**:
    *   `Official Shopify Python SDK`: Heavily synchronous and difficult to customize for async, non-blocking routing patterns.
    *   `Direct GraphQL Integrations`: Higher complexity for standard CRUD lookups, although more performant for bulk data operations.
*   **Rationale**: By writing a custom wrapper around `httpx.AsyncClient` that mirrors REST payload endpoints, we can instantly switch between real Shopify sandboxes and a local mockup environment. This decouples frontend development from Sandbox API rate limits.
*   **Trade-offs**: Requires writing custom mapping functions (`_map_shopify_order`) to transform raw JSON response bodies into local Pydantic models.

---

## 4. Prompt Engineering Architecture

*   **Decision**: Single-system prompt configuration combined with standard JSON-schema Function Declarations (Tools) instead of a multi-agent framework (e.g. LangChain, CrewAI).
*   **Alternatives Considered**:
    *   `LangChain Agent Executor`: Introduces heavy dependency graphs, complex debug paths, and high token overhead.
    *   `LangGraph Multi-Agent Flow`: Clean separation of tasks (e.g. Refund agent, Tracking agent) but significantly increases round-trip API delays.
*   **Rationale**: Modern LLMs are highly proficient at handling multiple tools in a single context window. A unified, clear system prompt with well-defined tool schemas runs much faster, is easier to debug, and maintains a lower token footprint.
*   **Trade-offs**: The system prompt becomes a critical point of failure; modifications must be heavily tested to avoid regression in tool dispatch behavior.

---

## 5. Error Handling Pattern

*   **Decision**: Two-tiered validation framework where FastAPI routers catch Pydantic validation failures natively (returning HTTP 422) and services raise standard Python exceptions (e.g. `ValueError`) translated into HTTP 400.
*   **Alternatives Considered**:
    *   `Global Exception Interceptors`: Catching everything at middleware levels. Less expressive for contextual UI responses.
    *   `Tuple Returns (Result, Error)`: Go-style error returns. Adds boilerplate in Python.
*   **Rationale**: Keeps routers declarative while keeping service business logic decoupled from FastAPI's internal `HTTPException` dependencies.
*   **Trade-offs**: There is some inconsistency in the current implementation where some routers wrap operations in `APIResponse(success=False)` instead of raising native HTTP error codes. This requires alignment.

---

## 6. Escalation Routing Flow

*   **Decision**: Deterministic rule-based allocation (auto-routing based on ticket priority maps) combined with LLM sentiment-triggered escalations.
*   **Alternatives Considered**:
    *   `Fully Agentic Escalation`: Letting the LLM decide which manager gets which ticket. Highly unpredictable.
    *   `Round-Robin / Random Assignment`: Fair, but ignores agent specialty or critical status.
*   **Rationale**: Deterministic routing maps (e.g. CRITICAL tickets go directly to the Team Lead) ensure SLAs are reliably hit. The AI acts simply as the detector, while the backend code handles assignment logic.
*   **Trade-offs**: Routing configurations are currently hard-coded inside the `escalation_service.py` file, requiring code redeploys to modify team assignments.

---

## 7. UI Design Paradigm

*   **Decision**: Dark mode glassmorphism theme using Tailwind CSS v4 custom variables and client-side page rendering.
*   **Alternatives Considered**:
    *   `Classic Light Mode (SaaS style)`: Functional, but lacks the visual distinction requested in modern premium systems.
    *   `Server Component Rendering (RSC)`: Standard for Next.js, but makes client-side search filtering, active state overlays, and chat timelines harder to sync.
*   **Rationale**: The glassmorphic aesthetic (using blurs, border gradients, and staggered animations) offers a premium visual experience. Opting for client-side pages simplifies managing high-frequency user interactions (like chat messaging and modal step wizards).
*   **Trade-offs**: Higher bundle sizes and slightly slower initial page loads compared to pure Server Components.

---

## 8. Deployment Strategy

*   **Decision**: Decoupled Static Frontend hosting (Vercel/Amplify) + Containerized ASGI Backend (Docker on AWS ECS / GCP Cloud Run).
*   **Alternatives Considered**:
    *   `Monolithic Next.js + FastAPI inside one VPS`: Easy to set up initially, but scale vectors for API inference and frontend assets are completely different.
    *   `Serverless Backend (AWS Lambda)`: Cheap, but introduces cold starts that degrade real-time chat experiences.
*   **Rationale**: Standardizing the backend with a `requirements.txt` environment simplifies packaging the system into a lightweight Docker image. Decoupling the frontend allows static pages to load instantly from CDNs globally.
*   **Trade-offs**: Requires managing separate hosting configurations, CORS rules, and independent CI/CD pipelines.
