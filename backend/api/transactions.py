"""
Transaction endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from db import get_db
from db.models import User
from models.schemas import TransactionCreate, TransactionResponse
from services import TransactionService
from api.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("", response_model=TransactionResponse)
def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new transaction."""
    transaction = TransactionService.create_transaction(
        db=db,
        user_id=current_user.id,
        transaction_data=transaction_data,
        source="manual",
    )
    return transaction


@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    month: Optional[str] = None,  # YYYY-MM format
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List transactions for a month (default: current)."""
    if month:
        try:
            year, month_num = map(int, month.split("-"))
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="Invalid month format (use YYYY-MM)")
    else:
        today = datetime.now()
        year, month_num = today.year, today.month

    transactions = TransactionService.get_transactions_for_month(
        db=db,
        user_id=current_user.id,
        year=year,
        month=month_num,
    )
    return transactions
