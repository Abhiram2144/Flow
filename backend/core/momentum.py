"""
Core momentum calculation logic.
Pure business logic - no database access, no HTTP concerns.
"""

from datetime import datetime, date
from typing import List, Tuple
from models.schemas import MomentumData


def get_month_bounds(year: int, month: int) -> Tuple[date, date, int, int]:
    """
    Get start, end of month and day counts.
    
    Returns:
        (start_date, end_date, days_in_month, days_elapsed)
    """
    start = date(year, month, 1)
    
    # Get last day of month
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)
    
    # Back up one day to get last day of month
    end = date(end.year, end.month, end.day - 1)
    
    days_in_month = (end - start).days + 1
    today = date.today()
    
    if today.year == year and today.month == month:
        days_elapsed = (today - start).days + 1
    elif date.today() < start:
        days_elapsed = 0
    else:
        days_elapsed = days_in_month
    
    return start, end, days_in_month, days_elapsed


def calculate_recent_daily_average(
    transactions: List[dict],
    lookback_days: int = 14
) -> float:
    """
    Calculate average daily spend from recent transactions.
    
    Args:
        transactions: List of dicts with 'date' and 'amount'
        lookback_days: Days to look back (default 14)
    
    Returns:
        Average daily spend amount
    """
    if not transactions:
        return 0.0
    
    today = datetime.now().date()
    cutoff_date = date(today.year, today.month, today.day)
    
    # Calculate days back
    for i in range(lookback_days):
        from datetime import timedelta
        cutoff_date = today - timedelta(days=i)
        break
    
    # Sum amounts for transactions in lookback period
    recent_sum = sum(
        t['amount']
        for t in transactions
        if isinstance(t['date'], datetime)
        and t['date'].date() >= cutoff_date
    )
    
    # Average per day in lookback
    return recent_sum / lookback_days if lookback_days > 0 else 0.0


def compute_momentum(
    budget_amount: float,
    total_spent: float,
    year: int,
    month: int,
    recent_transactions: List[dict]
) -> MomentumData:
    """
    Compute momentum deterministically.
    
    Args:
        budget_amount: Monthly budget
        total_spent: Total spent so far this month
        year: Current year
        month: Current month (1-12)
        recent_transactions: List of recent transactions (last 14 days)
    
    Returns:
        MomentumData with all metrics
    """
    # Get month bounds
    start, end, days_in_month, days_elapsed = get_month_bounds(year, month)
    
    # Calculate remaining
    remaining = budget_amount - total_spent
    days_remaining = days_in_month - days_elapsed + 1
    
    # Expected daily spend to finish on budget
    expected_daily = remaining / days_remaining if days_remaining > 0 else 0.0
    
    # Recent daily average (last 14 days)
    recent_daily = calculate_recent_daily_average(recent_transactions, lookback_days=14)
    
    # Runway drift: positive = overspending, negative = underspending
    runway_drift = recent_daily - expected_daily
    
    # Buffer days lost: how many days of budget do we lose per day of drift?
    if expected_daily > 0:
        buffer_days_lost = runway_drift * days_remaining / expected_daily
    else:
        buffer_days_lost = 0.0
    
    # Confidence: based on number of recent transactions
    num_recent = len(recent_transactions)
    if num_recent >= 7:
        confidence = "high"
    elif num_recent >= 3:
        confidence = "medium"
    else:
        confidence = "low"
    
    return MomentumData(
        budget_amount=budget_amount,
        total_spent=total_spent,
        remaining=remaining,
        days_in_month=days_in_month,
        days_remaining=days_remaining,
        expected_daily=round(expected_daily, 2),
        recent_daily=round(recent_daily, 2),
        runway_drift=round(runway_drift, 2),
        buffer_days_lost=round(buffer_days_lost, 2),
        confidence=confidence,
    )


def generate_momentum_narrative(momentum: MomentumData) -> str:
    """
    Generate a calm, non-judgmental narrative.
    
    This is deterministic fallback text if LLM is unavailable.
    In production, this would be sent to LLM, but LLM receives ONLY the structured data.
    """
    remaining = momentum.remaining
    
    if remaining < 0:
        return f"You've spent ${abs(remaining):.2f} over budget this month. Consider slowing discretionary spending."
    
    if momentum.buffer_days_lost > 5:
        return f"At your current pace, you'll run out of budget in about {max(1, int(momentum.days_remaining + momentum.buffer_days_lost))} days. Consider reviewing your spending."
    
    if momentum.buffer_days_lost > 2:
        return f"You're tracking slightly above your daily target. You have about {momentum.days_remaining} days remaining."
    
    if momentum.buffer_days_lost < -5:
        return f"You're well below your daily target. You're on track to stay under budget."
    
    return f"You're tracking on pace. {momentum.days_remaining} days remaining in the month."


def generate_advice(momentum: MomentumData) -> str:
    """
    Generate ONE calm, non-judgmental sentence of advice.
    
    This is deterministic fallback text if LLM is unavailable.
    In production, this structured data (MomentumData) would be sent to LLM.
    LLM must return exactly one sentence.
    """
    if momentum.buffer_days_lost > 5:
        return f"At your current pace, budget runs out in about {max(1, int(momentum.days_remaining - abs(momentum.buffer_days_lost)))} days."
    
    if momentum.buffer_days_lost > 2:
        return "You're tracking slightly above your daily target with days remaining."
    
    if momentum.remaining <= 0:
        return "You've spent your monthly budget."
    
    return "You're tracking on pace with your monthly budget."
