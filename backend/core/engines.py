"""
Core engines implementing Flow's business logic.

Each engine is small, focused, and composable.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from .models import (
    Transaction,
    MerchantProfile,
    Need,
    WeatherState,
    MomentumContext,
    TransactionSource,
)


class TransactionNormalizer:
    """
    Normalizes all input sources (bank, manual, receipt) into unified Transaction model.
    Applies source priority: receipt > manual > bank.
    """
    
    @staticmethod
    def normalize(
        source: str,
        date: datetime,
        amount: float,
        merchant_name: str,
        merchant_category: Optional[str] = None,
        notes: Optional[str] = None,
        confidence: float = 1.0,
    ) -> Transaction:
        """
        Normalize input data into Transaction.
        """
        return Transaction(
            id=f"txn_{datetime.now().timestamp()}",
            date=date,
            amount=amount,
            merchant_name=merchant_name,
            merchant_category=merchant_category,
            source=source,
            confidence=confidence,
            notes=notes,
        )


class MerchantPatternEngine:
    """
    Builds merchant profiles and detects:
    - Recurrence (is this a recurring merchant?)
    - Average intervals (how often?)
    - Spend ranges
    - Typical duration (how long does this need last?)
    """
    
    def __init__(self):
        self.merchants: Dict[str, MerchantProfile] = {}
    
    def ingest_transaction(self, transaction: Transaction) -> None:
        """
        Add a transaction to merchant profile.
        """
        merchant = transaction.merchant_name
        
        if merchant not in self.merchants:
            self.merchants[merchant] = MerchantProfile(
                merchant_name=merchant,
                category=transaction.merchant_category,
            )
        
        profile = self.merchants[merchant]
        
        # Update counts
        profile.transaction_count += 1
        
        # Update amount stats
        if profile.transaction_count == 1:
            profile.avg_amount = transaction.amount
            profile.amount_range = (transaction.amount, transaction.amount)
        else:
            old_avg = profile.avg_amount
            profile.avg_amount = (old_avg * (profile.transaction_count - 1) + transaction.amount) / profile.transaction_count
            profile.amount_range = (
                min(profile.amount_range[0], transaction.amount),
                max(profile.amount_range[1], transaction.amount),
            )
        
        profile.last_seen = transaction.date
    
    def analyze_patterns(self, merchant: str, transactions: List[Transaction]) -> Optional[MerchantProfile]:
        """
        Analyze transaction history for a merchant and update profile.
        """
        if merchant not in self.merchants:
            return None
        
        merchant_txns = [t for t in transactions if t.merchant_name == merchant]
        if len(merchant_txns) < 2:
            return self.merchants[merchant]
        
        # Sort by date
        merchant_txns.sort(key=lambda t: t.date)
        
        # Detect recurrence
        intervals = []
        for i in range(1, len(merchant_txns)):
            delta = (merchant_txns[i].date - merchant_txns[i-1].date).days
            if delta > 0:
                intervals.append(delta)
        
        if intervals:
            avg_interval = sum(intervals) / len(intervals)
            # Consider recurring if appears regularly (CV < 0.5)
            cv = (sum((x - avg_interval) ** 2 for x in intervals) / len(intervals)) ** 0.5 / avg_interval if avg_interval > 0 else float('inf')
            
            profile = self.merchants[merchant]
            profile.is_recurring = cv < 0.5 and len(intervals) >= 2
            profile.avg_interval_days = avg_interval if profile.is_recurring else None
            
            # Infer typical duration (e.g., groceries last ~7 days)
            # This is the interval between transactions (how long the need lasts)
            if profile.is_recurring:
                profile.typical_duration_days = avg_interval
            
            # Pattern confidence: higher with more consistent intervals
            profile.pattern_confidence = max(0.0, 1.0 - cv) if profile.is_recurring else 0.5
        
        return self.merchants[merchant]
    
    def get_profile(self, merchant: str) -> Optional[MerchantProfile]:
        """Retrieve merchant profile."""
        return self.merchants.get(merchant)


class NeedFulfillmentEngine:
    """
    Determines whether a need (e.g., weekly essentials) is fulfilled.
    Uses deterministic rules + historical intervals.
    """
    
    def __init__(self):
        self.needs: Dict[str, Need] = {}
    
    def evaluate_need(
        self,
        need_name: str,
        need_category: str,
        merchant_profiles: Dict[str, MerchantProfile],
        current_date: datetime,
        contributing_merchants: List[str],
    ) -> Need:
        """
        Evaluate if a need is currently fulfilled based on merchant patterns.
        """
        if need_name not in self.needs:
            self.needs[need_name] = Need(
                id=f"need_{need_name.lower().replace(' ', '_')}",
                name=need_name,
                category=need_category,
                contributing_merchants=contributing_merchants,
            )
        
        need = self.needs[need_name]
        
        # Check if any contributing merchant was seen recently
        latest_fulfill_date = None
        confidence_scores = []
        
        for merchant in contributing_merchants:
            profile = merchant_profiles.get(merchant)
            if profile and profile.last_seen:
                if latest_fulfill_date is None or profile.last_seen > latest_fulfill_date:
                    latest_fulfill_date = profile.last_seen
                
                # If recurring, check if within typical interval
                if profile.is_recurring and profile.typical_duration_days:
                    days_since = (current_date - profile.last_seen).days
                    if days_since <= profile.typical_duration_days:
                        confidence_scores.append(profile.pattern_confidence)
        
        need.last_fulfilled_date = latest_fulfill_date
        
        # Determine fulfillment
        if latest_fulfill_date:
            days_since_fulfill = (current_date - latest_fulfill_date).days
            # Assume default duration of 7 days if not specified
            default_duration = 7.0
            typical_duration = contributing_merchants and merchant_profiles.get(contributing_merchants[0], Need(id="", name="", category="")).typical_duration_days or default_duration
            
            need.is_fulfilled = days_since_fulfill <= typical_duration
            need.fulfillment_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.5
            
            if need.typical_duration_days:
                need.expected_next_date = latest_fulfill_date + timedelta(days=need.typical_duration_days)
        
        return need


class MomentumEngine:
    """
    Computes continuous momentum score considering:
    - Time remaining in period
    - Spending pace
    - Fulfilled vs pending needs
    """
    
    @staticmethod
    def compute_momentum(
        period_start: datetime,
        period_end: datetime,
        total_spent: float,
        fulfilled_needs: List[str],
        pending_needs: List[str],
        anomalies: List[str] = None,
    ) -> Tuple[float, MomentumContext]:
        """
        Compute momentum score (0.0 to 1.0+).
        
        Returns:
            momentum_score: Float representing financial momentum
            context: MomentumContext with detailed factors
        """
        now = datetime.now()
        days_elapsed = (now - period_start).days
        days_remaining = (period_end - now).days
        total_period_days = (period_end - period_start).days
        
        if days_elapsed == 0:
            days_elapsed = 1  # Avoid division by zero
        
        # Calculate spending pace
        avg_daily_spend = total_spent / days_elapsed if days_elapsed > 0 else 0.0
        projected_total = avg_daily_spend * total_period_days
        
        # Momentum is a ratio of projected spend to ideal spend
        # If we assume a reasonable budget, we can use a baseline
        # For now, normalize to period average
        ideal_daily_budget = 50.0  # Assume $50/day as baseline (configurable)
        ideal_total = ideal_daily_budget * total_period_days
        
        momentum_score = projected_total / ideal_total if ideal_total > 0 else 0.0
        
        # Adjust for need fulfillment
        need_fulfillment_ratio = len(fulfilled_needs) / (len(fulfilled_needs) + len(pending_needs)) if (len(fulfilled_needs) + len(pending_needs)) > 0 else 0.5
        momentum_score *= (0.5 + 0.5 * need_fulfillment_ratio)  # Positive adjustment
        
        context = MomentumContext(
            period_start=period_start,
            period_end=period_end,
            days_remaining=days_remaining,
            total_spent=total_spent,
            avg_daily_spend=avg_daily_spend,
            projected_total=projected_total,
            fulfilled_needs=fulfilled_needs,
            pending_needs=pending_needs,
            detected_anomalies=anomalies or [],
        )
        
        return momentum_score, context


class WeatherMapper:
    """
    Maps momentum score to qualitative weather state.
    Weather changes gradually (smoothing applied).
    """
    
    def __init__(self):
        self.current_state = WeatherState.SUNNY
        self.state_history = []
    
    @staticmethod
    def score_to_weather(momentum_score: float, time_of_day: str = "day") -> WeatherState:
        """
        Map momentum score to weather state.
        
        Score interpretation:
        - < 0.7: Sunny / Clear Night
        - 0.7-0.85: Cloudy
        - 0.85-1.2: Rain
        - > 1.2: Storm
        """
        if momentum_score < 0.7:
            return WeatherState.CLEAR_NIGHT if time_of_day == "night" else WeatherState.SUNNY
        elif momentum_score < 0.85:
            return WeatherState.CLOUDY
        elif momentum_score < 1.2:
            return WeatherState.RAIN
        else:
            return WeatherState.STORM
    
    def update_state(self, new_state: WeatherState, smoothing: bool = True) -> WeatherState:
        """
        Update weather state with optional smoothing.
        Smoothing prevents sudden jumps (e.g., Sunny -> Storm in one update).
        """
        if smoothing:
            # Prevent jumping more than one step
            state_progression = {
                WeatherState.SUNNY: [WeatherState.SUNNY, WeatherState.CLOUDY],
                WeatherState.CLEAR_NIGHT: [WeatherState.CLEAR_NIGHT, WeatherState.CLOUDY],
                WeatherState.CLOUDY: [WeatherState.SUNNY, WeatherState.CLOUDY, WeatherState.RAIN],
                WeatherState.RAIN: [WeatherState.CLOUDY, WeatherState.RAIN, WeatherState.STORM],
                WeatherState.STORM: [WeatherState.RAIN, WeatherState.STORM],
            }
            
            allowed_states = state_progression.get(self.current_state, [new_state])
            if new_state not in allowed_states:
                # Move one step closer
                if new_state == WeatherState.STORM:
                    new_state = WeatherState.RAIN
                elif new_state == WeatherState.RAIN:
                    new_state = WeatherState.CLOUDY
                elif new_state == WeatherState.SUNNY:
                    new_state = WeatherState.CLOUDY
        
        self.current_state = new_state
        self.state_history.append((datetime.now(), new_state))
        return self.current_state
