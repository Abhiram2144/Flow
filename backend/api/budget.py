"""
Budget endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from db.models import User
from models.schemas import BudgetCreate, BudgetResponse
from services import BudgetService
from api.auth import get_current_user

router = APIRouter(prefix="/budget", tags=["budget"])


@router.post("", response_model=BudgetResponse)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update budget for current month."""
    budget = BudgetService.get_or_create_current_budget(
        db=db,
        user_id=current_user.id,
        total_budget=budget_data.total_budget,
    )
    return budget


@router.get("/current", response_model=BudgetResponse)
def get_current_budget(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get budget for current month."""
    budget = BudgetService.get_current_budget(db=db, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="No budget set for current month")
    return budget
