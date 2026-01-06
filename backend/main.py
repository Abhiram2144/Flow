"""
Flow Finance API - Main Application Entry Point

A mobile-first personal finance app focused on helping users understand 
their financial momentum through explainable, deterministic logic.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import routes (to be created)
# from api.routes import transactions, merchants, momentum, explanations

# App lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events.
    """
    # Startup
    print("🌊 Flow Finance API Starting...")
    yield
    # Shutdown
    print("🌊 Flow Finance API Shutting Down...")


app = FastAPI(
    title="Flow Finance API",
    description="Personal finance momentum engine - explainable, privacy-first",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware for Expo/React Native mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "message": "🌊 Flow is flowing smoothly"
    }


# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "name": "Flow Finance API",
        "version": "0.1.0",
        "philosophy": "Past data suggests, present data overrides. Rules decide, ML assists, LLM explains.",
        "docs": "/docs",
    }


# Register route modules (implement routes in separate files)
# app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
# app.include_router(merchants.router, prefix="/api/v1/merchants", tags=["merchants"])
# app.include_router(momentum.router, prefix="/api/v1/momentum", tags=["momentum"])
# app.include_router(explanations.router, prefix="/api/v1/explanations", tags=["explanations"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
