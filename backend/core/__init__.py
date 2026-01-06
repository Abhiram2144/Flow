"""Core business logic package."""

from .momentum import (
    compute_momentum,
    generate_momentum_narrative,
    generate_gentle_suggestions,
    get_month_bounds,
    calculate_recent_daily_average,
)

__all__ = [
    "compute_momentum",
    "generate_momentum_narrative",
    "generate_gentle_suggestions",
    "get_month_bounds",
    "calculate_recent_daily_average",
]
