"""
Flow Finance API - Main Application Entry Point

A mobile-first personal finance app focused on helping users understand 
their financial momentum through explainable, deterministic logic.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db
from api import auth, budget, transactions, bank_statement, momentum

# Initialize database on startup
init_db()

# Create app
app = FastAPI(
    title="Flow Finance API",
    description="Personal finance momentum engine - explainable, privacy-first",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "🌊 Flow is flowing smoothly",
    }


# Root
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Flow Finance API",
        "version": "0.1.0",
        "philosophy": "Past data suggests, present data overrides. Rules decide, ML assists, LLM explains.",
        "docs": "/docs",
    }


# Include routers
app.include_router(auth.router)
app.include_router(budget.router)
app.include_router(transactions.router)
app.include_router(bank_statement.router)
app.include_router(momentum.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

