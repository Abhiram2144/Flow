"""
Services layer - orchestrates database access and business logic.
"""

from datetime import datetime, date
from sqlalchemy.orm import Session
from typing import List, Optional

from db.models import User, Budget, Transaction, BankTransaction
from models.schemas import (
    BudgetCreate,
    TransactionCreate,
    BankStatementRow,
    MomentumResponse,
)
from core.momentum import (
    compute_momentum,
    generate_momentum_narrative,
    generate_gentle_suggestions,
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
            category=transaction_data.category,
            notes=transaction_data.notes,
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
        
        Returns:
            Number of transactions imported
        """
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
                    category=row.category,
                )
                db.add(txn)
                count += 1

        db.commit()
        return count


class MomentumService:
    """Momentum calculation and narrative generation."""

    @staticmethod
    def get_current_momentum(db: Session, user_id: str) -> MomentumResponse:
        """
        Compute and return current momentum for user.
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
                narrative="Set a budget to see momentum.",
                gentle_suggestions=[],
            )

        # Get all transactions for this month
        transactions = TransactionService.get_transactions_for_month(db, user_id, year, month)
        total_spent = sum(t.amount for t in transactions)

        # Get recent transactions for daily average
        recent_txns = TransactionService.get_recent_transactions(db, user_id, days=14)
        recent_txns_dicts = [
            {"date": t.date, "amount": t.amount}
            for t in recent_txns
        ]

        # Compute momentum
        momentum = compute_momentum(
            budget_amount=budget.total_budget,
            total_spent=total_spent,
            year=year,
            month=month,
            recent_transactions=recent_txns_dicts,
        )

        # Generate narrative (fallback is deterministic, LLM integration optional)
        narrative = generate_momentum_narrative(momentum)
        suggestions = generate_gentle_suggestions(momentum)

        return MomentumResponse(
            month=month_str,
            momentum=momentum,
            narrative=narrative,
            gentle_suggestions=suggestions,
        )
