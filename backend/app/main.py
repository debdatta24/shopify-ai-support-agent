from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import chat, orders, refunds, escalations, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    print("[*] CommerceMind AI Backend starting...")
    print(f"   Environment: {settings.app_env}")
    print(f"   OpenAI configured: {settings.has_openai}")
    print(f"   Shopify configured: {settings.has_shopify}")
    print(f"   CORS origins: {settings.cors_origin_list}")

    if not settings.has_openai:
        print("   [!] OpenAI API key not set -- AI agent will use mock responses")
    if not settings.has_shopify:
        print("   [!] Shopify credentials not set -- using mock order data")

    yield

    print("[*] CommerceMind AI Backend shutting down...")


app = FastAPI(
    title="CommerceMind AI",
    description="AI-powered ecommerce customer support backend with OpenAI and Shopify integration",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(refunds.router, prefix="/api/refunds", tags=["Refunds"])
app.include_router(escalations.router, prefix="/api/escalations", tags=["Escalations"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "CommerceMind AI",
        "version": "1.0.0",
        "openai_configured": settings.has_openai,
        "shopify_configured": settings.has_shopify,
    }
