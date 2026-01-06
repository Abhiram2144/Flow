"""
Advice endpoint - returns single sentence based on momentum.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from db.models import User
from services import MomentumService
from api.auth import get_current_user

router = APIRouter(prefix="/advice", tags=["advice"])


class AdviceResponse(dict):
    """Simple advice response."""
    pass


@router.get("/current")
def get_current_advice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get current financial advice (single sentence).
    
    Returns exactly one calm, non-judgmental sentence.
    """
    momentum_response = MomentumService.get_current_momentum(db=db, user_id=current_user.id)
    
    return {
        "month": momentum_response.month,
        "advice": momentum_response.advice,
    }
