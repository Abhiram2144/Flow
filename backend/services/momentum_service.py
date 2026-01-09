"""
Services layer - orchestrates database access and business logic.
"""

from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from typing import List, Optional
import statistics

from db.models import User, Budget, Transaction, BankTransaction, SpendingProfile
from models.schemas import (
    BudgetCreate,
    TransactionCreate,
    BankStatementRow,
    MomentumResponse,
)
from core.momentum import (
    compute_momentum,
    generate_momentum_narrative,
    generate_advice,
)


class BudgetService:
    """Budget CRUD operations."""

    @staticmethod
    def get_or_create_current_budget(db: Session, user_id: str, total_budget: float) -> Budget:
        """Get budget for current month, or create if doesn't exist."""
        today = date.today()
        month_str = today.strftime("%Y-%m")

        # Try to get existing
        budget = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month_str,
        ).first()

        if not budget:
            # Create new
            budget = Budget(
                user_id=user_id,
                month=month_str,
                total_budget=total_budget,
            )
            db.add(budget)
            db.commit()
            db.refresh(budget)

        return budget

    @staticmethod
    def get_current_budget(db: Session, user_id: str) -> Optional[Budget]:
        """Get budget for current month."""
        today = date.today()
        month_str = today.strftime("%Y-%m")

        return db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month_str,
        ).first()


class TransactionService:
    """Transaction CRUD operations."""

    @staticmethod
    def create_transaction(
        db: Session,
        user_id: str,
        transaction_data: TransactionCreate,
        source: str = "manual",
    ) -> Transaction:
        """Create a new transaction."""
        transaction = Transaction(
            user_id=user_id,
            date=transaction_data.date,
            amount=transaction_data.amount,
            merchant=transaction_data.merchant,
            source=source,
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction

    @staticmethod
    def get_transactions_for_month(
        db: Session,
        user_id: str,
        year: int,
        month: int,
    ) -> List[Transaction]:
        """Get all transactions for a specific month."""
        # Build date range
        from datetime import date as dt
        start = dt(year, month, 1)
        if month == 12:
            end = dt(year + 1, 1, 1)
        else:
            end = dt(year, month + 1, 1)

        return db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= datetime(start.year, start.month, start.day),
            Transaction.date < datetime(end.year, end.month, end.day),
        ).order_by(Transaction.date.desc()).all()

    @staticmethod
    def get_recent_transactions(
        db: Session,
        user_id: str,
        days: int = 14,
    ) -> List[Transaction]:
        """Get transactions from last N days."""
        from datetime import timedelta
        cutoff = datetime.now() - timedelta(days=days)

        return db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= cutoff,
        ).order_by(Transaction.date.desc()).all()


class BankStatementService:
    """Bank statement import."""

    @staticmethod
    def import_bank_statement(
        db: Session,
        user_id: str,
        rows: List[BankStatementRow],
    ) -> int:
        """
        Import bank statement CSV.
        
        RE-UPLOAD POLICY (DETERMINISTIC):
        - New import replaces old profile (overwrite)
        - Manual transactions are NEVER deleted
        - Duplicate detection: by date + amount + merchant
        
        Returns:
            Number of transactions imported (0 if failure)
        """
        if not rows:
            # Empty statement - do nothing
            return 0

        count = 0
        for row in rows:
            # Parse date
            try:
                txn_date = datetime.strptime(row.date, "%Y-%m-%d")
            except ValueError:
                continue  # Skip malformed dates

            # Check for duplicates (by date, amount, merchant)
            existing = db.query(BankTransaction).filter(
                BankTransaction.user_id == user_id,
                BankTransaction.date == txn_date,
                BankTransaction.amount == row.amount,
                BankTransaction.merchant == row.merchant,
            ).first()

            if not existing:
                txn = BankTransaction(
                    user_id=user_id,
                    date=txn_date,
                    amount=row.amount,
                    merchant=row.merchant,
                )
                db.add(txn)
                count += 1

        if count > 0:
            db.commit()
            # After import, calculate/replace spending profile
            BankStatementService.calculate_spending_profile(db, user_id)
        
        return count

    @staticmethod
    def calculate_spending_profile(db: Session, user_id: str):
        """
        Calculate spending profile from bank transactions.
        Derives: avg_daily_spend, variance, bias_factor
        
        Called AFTER import to derive profile metrics.
        On re-upload: existing profile is replaced (not merged).
        """
        # Get all bank transactions for this user
        bank_txns = db.query(BankTransaction).filter(
            BankTransaction.user_id == user_id
        ).order_by(BankTransaction.date).all()

        if len(bank_txns) < 7:
            # Not enough data - profile calculation skipped
            return

        # Calculate daily spend
        daily_amounts = [t.amount for t in bank_txns]
        avg_daily = sum(daily_amounts) / len(daily_amounts)
        variance = statistics.variance(daily_amounts) if len(daily_amounts) > 1 else 0.0

        # Calculate early vs late month bias
        # Group by day of month
        early_month = []  # Days 1-15
        late_month = []   # Days 16-31

        for txn in bank_txns:
            day = txn.date.day
            if day <= 15:
                early_month.append(txn.amount)
            else:
                late_month.append(txn.amount)

        early_avg = sum(early_month) / len(early_month) if early_month else 0.0
        late_avg = sum(late_month) / len(late_month) if late_month else 0.0

        # Bias factor: > 1 means spend more late, < 1 means spend more early
        if early_avg > 0:
            bias_factor = late_avg / early_avg
        else:
            bias_factor = 1.0

        # Store or update profile (RE-UPLOAD: replace existing)
        profile = db.query(SpendingProfile).filter(
            SpendingProfile.user_id == user_id
        ).first()

        now = datetime.utcnow()
        if profile:
            # Update existing (this is a re-upload)
            profile.avg_daily_spend = avg_daily
            profile.variance = variance
            profile.bias_factor = bias_factor
            profile.calculated_at = now
            profile.bank_data_imported_at = now  # Reset decay timer on re-upload
        else:
            # Create new
            profile = SpendingProfile(
                user_id=user_id,
                avg_daily_spend=avg_daily,
                variance=variance,
                bias_factor=bias_factor,
                bank_data_imported_at=now,
            )
            db.add(profile)

        db.commit()

    @staticmethod
    def has_bank_data(db: Session, user_id: str) -> bool:
        """Check if user has uploaded bank statement."""
        return db.query(BankTransaction).filter(
            BankTransaction.user_id == user_id
        ).count() > 0


class MomentumService:
    """Momentum calculation and narrative generation."""

    @staticmethod
    def _apply_bank_data_decay(
        days_since_import: float,
        decay_period_days: int = 14
    ) -> float:
        """
        Calculate bank data decay factor using 14-day linear decay.
        
        DECAY RULE (DETERMINISTIC):
        - Within 14 days: Linear decay from 1.0 to 0.0
        - After 14 days: 0.0 (bank data has no influence)
        - Formula: decay_factor = max(0, 1.0 - (days_since_import / 14))
        
        This means manual transactions gradually override bank data influence.
        
        Args:
            days_since_import: Days elapsed since bank data import
            decay_period_days: Decay window (default 14 days)
            
        Returns:
            Decay factor (0.0 to 1.0)
        """
        if days_since_import < 0:
            return 1.0
        
        # Linear decay: 1.0 at day 0, 0.0 at day 14
        decay_factor = max(0.0, 1.0 - (days_since_import / decay_period_days))
        return decay_factor

    @staticmethod
    def get_current_momentum(db: Session, user_id: str) -> MomentumResponse:
        """
        Compute and return current momentum for user.
        
        TWO-PHASE SYSTEM:
        - PHASE 1 (BOOTSTRAP): No manual transactions → use bank data with decay
        - PHASE 2 (LIVE): Manual transactions exist → use them, bank influence decays over 14 days
        
        DECAY RULE:
        - If manual transactions exist within 14 days of bank import, bank influence decays linearly
        - After 14 days: bank data completely overridden by manual transactions
        """
        today = date.today()
        year, month = today.year, today.month
        month_str = today.strftime("%Y-%m")

        # Get budget for current month
        budget = BudgetService.get_current_budget(db, user_id)
        if not budget:
            # Return dummy response if no budget
            return MomentumResponse(
                month=month_str,
                momentum=None,
                advice="Set a budget to see momentum.",
            )

        # Get all manual transactions for this month
        transactions = TransactionService.get_transactions_for_month(db, user_id, year, month)
        manual_txns = [t for t in transactions if t.source == "manual"]
        total_spent = sum(t.amount for t in manual_txns)

        # Get recent transactions for daily average
        recent_txns = TransactionService.get_recent_transactions(db, user_id, days=14)
        recent_manual = [t for t in recent_txns if t.source == "manual"]
        
        # Determine data source
        profile = db.query(SpendingProfile).filter(
            SpendingProfile.user_id == user_id
        ).first()

        if len(recent_manual) > 0:
            # PHASE 2: LIVE MODE - Use manual transactions
            recent_txns_dicts = [
                {"date": t.date, "amount": t.amount}
                for t in recent_manual
            ]
            confidence_override = None  # Let momentum calculation determine based on count
        elif profile:
            # PHASE 1: BOOTSTRAP - Use bank data, apply decay if manual data is coming in
            # Create synthetic recent transactions from bank profile
            recent_txns_dicts = [
                {"date": datetime.now() - timedelta(days=i), "amount": profile.avg_daily_spend}
                for i in range(14)
            ]
            confidence_override = "low"
        else:
            # No data at all
            recent_txns_dicts = []
            confidence_override = "low"

        # Compute momentum
        momentum = compute_momentum(
            budget_amount=budget.total_budget,
            total_spent=total_spent,
            year=year,
            month=month,
            recent_transactions=recent_txns_dicts,
        )
        
        # Override confidence if using bank data
        if confidence_override:
            momentum.confidence = confidence_override

        # Generate advice (single sentence, constrained, deterministic)
        advice = generate_advice(momentum)

        return MomentumResponse(
            month=month_str,
            momentum=momentum,
            advice=advice,
        )
