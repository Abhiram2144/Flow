"""
Momentum and insight endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from db.models import User
from models.schemas import MomentumResponse
from services import MomentumService
from api.auth import get_current_user

router = APIRouter(prefix="/momentum", tags=["momentum"])


@router.get("/current", response_model=MomentumResponse)
def get_current_momentum(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get current financial momentum.
    
    Returns:
    - momentum: Structured momentum data
    - narrative: Human-readable explanation
    - gentle_suggestions: Non-judgmental suggestions
    """
    return MomentumService.get_current_momentum(db=db, user_id=current_user.id)
