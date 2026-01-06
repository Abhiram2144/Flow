"""Pydantic schemas for API requests and responses."""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


# ==================== AUTH ====================

class UserCreate(BaseModel):
    """Request body for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """Request body for login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


# ==================== BUDGET ====================

class BudgetCreate(BaseModel):
    """Create budget for current month."""
    total_budget: float = Field(..., gt=0)


class BudgetResponse(BaseModel):
    """Budget response."""
    id: str
    user_id: str
    month: str
    total_budget: float
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== TRANSACTIONS ====================

class TransactionCreate(BaseModel):
    """Create a transaction."""
    date: datetime
    amount: float = Field(..., gt=0)
    merchant: str = Field(..., min_length=1)
    category: Optional[str] = None
    notes: Optional[str] = None


class TransactionResponse(BaseModel):
    """Transaction response."""
    id: str
    user_id: str
    date: datetime
    amount: float
    merchant: str
    source: str
    category: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BankStatementRow(BaseModel):
    """Single row from bank CSV."""
    date: str  # Expected format: YYYY-MM-DD
    amount: float
    merchant: str
    category: Optional[str] = None


class BankStatementUpload(BaseModel):
    """Bank statement CSV upload."""
    transactions: List[BankStatementRow]


# ==================== MOMENTUM ====================

class MomentumData(BaseModel):
    """Structured momentum calculation result (used by LLM)."""
    budget_amount: float
    total_spent: float
    remaining: float
    days_in_month: int
    days_remaining: int
    expected_daily: float
    recent_daily: float
    runway_drift: float
    buffer_days_lost: float
    confidence: str  # "high", "medium", "low"


class MomentumResponse(BaseModel):
    """Complete momentum response."""
    month: str
    momentum: MomentumData
    narrative: str  # Human-readable explanation (from LLM or fallback)
    gentle_suggestions: List[str]
