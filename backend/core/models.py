"""
Core data models for Flow Finance.

Explicit, modular data structures representing the domain.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class TransactionSource(str, Enum):
    """Source priority: receipt > manual > bank"""
    BANK = "bank"
    MANUAL = "manual"
    RECEIPT = "receipt"


class Transaction(BaseModel):
    """
    Normalized transaction model - all inputs flow through this.
    """
    id: str = Field(..., description="Unique transaction identifier")
    date: datetime = Field(..., description="Transaction date")
    amount: float = Field(..., description="Amount in local currency")
    currency: str = Field(default="USD", description="Currency code")
    
    # Merchant info
    merchant_name: str = Field(..., description="Merchant/vendor name")
    merchant_category: Optional[str] = Field(None, description="Category (e.g. groceries, transport)")
    
    # Source tracking
    source: TransactionSource = Field(..., description="Source of transaction data")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence in this transaction")
    
    # Notes
    notes: Optional[str] = Field(None, description="User notes or receipt extracted text")
    
    # Derived metadata (computed by backend)
    is_recurring: bool = Field(default=False, description="Detected as recurring")
    recurrence_pattern: Optional[str] = Field(None, description="e.g., 'weekly', 'monthly'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "txn_123",
                "date": "2024-01-15T10:30:00",
                "amount": 45.50,
                "currency": "USD",
                "merchant_name": "Whole Foods",
                "merchant_category": "groceries",
                "source": "manual",
                "confidence": 1.0,
                "notes": "Weekly groceries",
                "is_recurring": True,
                "recurrence_pattern": "weekly"
            }
        }


class MerchantProfile(BaseModel):
    """
    Merchant pattern intelligence - what we know about a merchant.
    """
    merchant_name: str = Field(..., description="Merchant name")
    category: Optional[str] = Field(None, description="Inferred category")
    
    # Pattern detection
    transaction_count: int = Field(default=0, description="Number of transactions")
    avg_amount: float = Field(default=0.0, description="Average transaction amount")
    amount_range: tuple[float, float] = Field(default=(0.0, 0.0), description="(min, max)")
    
    # Recurrence
    is_recurring: bool = Field(default=False, description="Is this a recurring merchant?")
    avg_interval_days: Optional[float] = Field(None, description="Avg days between transactions")
    typical_duration_days: Optional[float] = Field(None, description="How long does this 'need' last?")
    
    # Confidence
    pattern_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Confidence in detected pattern")
    last_seen: Optional[datetime] = Field(None, description="Last transaction date")
    
    class Config:
        json_schema_extra = {
            "example": {
                "merchant_name": "Whole Foods",
                "category": "groceries",
                "transaction_count": 12,
                "avg_amount": 52.30,
                "amount_range": [35.0, 85.0],
                "is_recurring": True,
                "avg_interval_days": 7.2,
                "typical_duration_days": 7.0,
                "pattern_confidence": 0.92,
                "last_seen": "2024-01-15T10:30:00"
            }
        }


class Need(BaseModel):
    """
    A financial need (e.g., weekly essentials, monthly utilities).
    """
    id: str = Field(..., description="Unique need identifier")
    name: str = Field(..., description="Need name (e.g., 'Weekly Groceries')")
    category: str = Field(..., description="Category")
    
    # Fulfillment logic
    is_fulfilled: bool = Field(default=False, description="Is this need currently fulfilled?")
    fulfillment_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Confidence in fulfillment status")
    
    # Timing
    last_fulfilled_date: Optional[datetime] = Field(None, description="When was this last fulfilled?")
    expected_next_date: Optional[datetime] = Field(None, description="When expected again?")
    typical_duration_days: float = Field(default=7.0, description="How long does fulfillment last?")
    
    # Merchants contributing to this need
    contributing_merchants: List[str] = Field(default=[], description="Merchant names that fulfill this need")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "need_groceries_1",
                "name": "Weekly Groceries",
                "category": "essentials",
                "is_fulfilled": True,
                "fulfillment_confidence": 0.88,
                "last_fulfilled_date": "2024-01-15T10:30:00",
                "expected_next_date": "2024-01-22T10:30:00",
                "typical_duration_days": 7.0,
                "contributing_merchants": ["Whole Foods", "Trader Joe's"]
            }
        }


class WeatherState(str, Enum):
    """Financial momentum weather states."""
    SUNNY = "sunny"          # Within limits, smooth flow
    CLEAR_NIGHT = "clear_night"  # Stable nighttime mood
    CLOUDY = "cloudy"        # Approaching limits, awareness needed
    RAIN = "rain"            # Slightly over limit
    STORM = "storm"          # Far beyond limit, stabilization mode


class MomentumContext(BaseModel):
    """
    Momentum calculation context - all factors that determine weather state.
    """
    period_start: datetime = Field(..., description="Start of analysis period")
    period_end: datetime = Field(..., description="End of analysis period")
    days_remaining: int = Field(..., description="Days remaining in period")
    
    # Spending metrics
    total_spent: float = Field(default=0.0, description="Total spent in period")
    avg_daily_spend: float = Field(default=0.0, description="Average daily spend")
    projected_total: float = Field(default=0.0, description="Projected total if pace continues")
    
    # Need status
    fulfilled_needs: List[str] = Field(default=[], description="Currently fulfilled needs")
    pending_needs: List[str] = Field(default=[], description="Pending needs")
    
    # Anomalies
    detected_anomalies: List[str] = Field(default=[], description="Gentle deviations from pattern")
    
    class Config:
        json_schema_extra = {
            "example": {
                "period_start": "2024-01-01T00:00:00",
                "period_end": "2024-01-31T23:59:59",
                "days_remaining": 16,
                "total_spent": 1250.00,
                "avg_daily_spend": 40.32,
                "projected_total": 1895.00,
                "fulfilled_needs": ["Weekly Groceries", "Transport"],
                "pending_needs": ["Utilities"],
                "detected_anomalies": ["Higher than usual groceries spend (15% above average)"]
            }
        }


class ExplainabilityContext(BaseModel):
    """
    Structured explanation object - the ONLY data passed to LLM.
    
    This ensures all narrative generation is grounded in observable facts,
    not black-box logic.
    """
    observation: str = Field(..., description="What we observed (e.g., 'Spent $120 on groceries')")
    pattern: str = Field(..., description="Historical pattern (e.g., 'Usually spend $45-60/week')")
    inference: str = Field(..., description="What we infer (e.g., 'This week is a stock-up week')")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence in this explanation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "observation": "You spent $120 on groceries this week",
                "pattern": "Your typical weekly grocery spend is $45-60",
                "inference": "This appears to be a stock-up week or special purchase",
                "confidence": 0.85
            }
        }


class Explanation(BaseModel):
    """
    Complete explanation with narrative (generated by LLM from context).
    """
    weather_state: WeatherState = Field(..., description="Current momentum weather state")
    momentum_confidence: float = Field(ge=0.0, le=1.0, description="Confidence in momentum assessment")
    
    contexts: List[ExplainabilityContext] = Field(default=[], description="Structured contexts")
    narrative: str = Field(..., description="Human-readable explanation (generated by LLM)")
    
    # Recommendations
    gentle_suggestions: List[str] = Field(default=[], description="Non-judgmental suggestions")
    
    class Config:
        json_schema_extra = {
            "example": {
                "weather_state": "cloudy",
                "momentum_confidence": 0.88,
                "contexts": [
                    {
                        "observation": "You've spent $1,250 so far this month",
                        "pattern": "Your typical spending is $1,200-1,400",
                        "inference": "You're tracking slightly above average",
                        "confidence": 0.92
                    }
                ],
                "narrative": "You're tracking slightly above your usual pace. This is normal given the stock-up week on groceries.",
                "gentle_suggestions": [
                    "Your essential needs are covered for the week",
                    "Consider mindful spending for discretionary items"
                ]
            }
        }
