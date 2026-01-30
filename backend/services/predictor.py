import pandas as pd
import joblib
import numpy as np
from .features import build_features
from typing import List, Dict

def predict_spending(transactions: List[Dict], model_path: str):
    model = joblib.load(model_path)
    df = build_features(transactions)
    X = df[[
        "avg_daily_spend", "last_7_days_spend", "last_14_days_spend",
        "spend_trend_slope", "spend_velocity", "spend_variance",
        "momentum", "weekend_ratio"
    ]].fillna(0)
    preds = model.predict(X)
    # Project next 7, 14, month-end
    next_7 = float(np.mean(preds[-7:]) * 7) if len(preds) >= 7 else float(np.mean(preds) * 7)
    next_14 = float(np.mean(preds[-14:]) * 14) if len(preds) >= 14 else float(np.mean(preds) * 14)
    month_end = float(np.mean(preds) * 30)
    # Simple risk/confidence
    trend = df["spend_trend_slope"].iloc[-1] if not df.empty else 0
    momentum = df["momentum"].iloc[-1] if not df.empty else 0
    weekend_ratio = df["weekend_ratio"].iloc[-1] if not df.empty else 0
    confidence = float(1 - min(abs(trend) / 10, 1))
    risk_score = float(min(abs(momentum) / 10 + weekend_ratio, 1))
    status = "OVER_BUDGET" if month_end > 1200 else "ON_TRACK"
    explanation = []
    if trend > 0.5:
        explanation.append("Daily spending trend is increasing")
    if momentum > 0.5:
        explanation.append("Momentum is above safe range")
    if weekend_ratio > 0.3:
        explanation.append("Weekend spending is consistently higher")
    return {
        "next_7_days": round(next_7, 2),
        "next_14_days": round(next_14, 2),
        "month_end_prediction": round(month_end, 2),
        "status": status,
        "confidence": round(confidence, 2),
        "risk_score": round(risk_score, 2),
        "explanation": explanation
    }
