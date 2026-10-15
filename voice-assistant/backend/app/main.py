"""FastAPI Application Entry Point."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("voice-assistant")

# Initialize FastAPI application
app = FastAPI(
    title="AI Voice Assistant API",
    description="Production-quality FastAPI backend for Alexa-like Voice Assistant using OpenAI Agents SDK & Groq.",
    version="1.0.0",
)

# Configure CORS for frontend access
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)


@app.get(
    "/health",
    tags=["System"],
    summary="Health Check",
    description="Returns the health status of the API service.",
)
async def health_check() -> dict[str, str]:
    """Health check endpoint to verify server is running."""
    return {"status": "ok", "service": "voice-assistant-backend"}


@app.get(
    "/",
    tags=["System"],
    summary="Root Endpoint",
)
async def root() -> dict[str, str]:
    """Welcome endpoint pointing to Swagger docs."""
    return {
        "message": "Welcome to AI Voice Assistant API",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
