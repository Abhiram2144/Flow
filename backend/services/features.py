import pandas as pd
import numpy as np
from typing import List, Dict

def build_features(transactions: List[Dict]) -> pd.DataFrame:
    df = pd.DataFrame(transactions)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")
    df["day_of_week"] = df["date"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"] >= 5
    df["daily_spend"] = df.groupby("date")["amount"].transform("sum")
    df["avg_daily_spend"] = df["daily_spend"].rolling(window=30, min_periods=1).mean()
    df["last_7_days_spend"] = df["daily_spend"].rolling(window=7, min_periods=1).sum()
    df["last_14_days_spend"] = df["daily_spend"].rolling(window=14, min_periods=1).sum()
    df["spend_trend_slope"] = df["daily_spend"].rolling(window=14, min_periods=2).apply(lambda x: np.polyfit(range(len(x)), x, 1)[0] if len(x) > 1 else 0, raw=True)
    df["spend_velocity"] = df["daily_spend"].diff().fillna(0)
    df["spend_variance"] = df["daily_spend"].rolling(window=14, min_periods=2).var().fillna(0)
    df["momentum"] = df["spend_velocity"].rolling(window=7, min_periods=1).mean()
    df["weekend_ratio"] = df.groupby("is_weekend")["amount"].transform("sum") / df["amount"].sum()
    # Category ratios
    cat_totals = df.groupby("category")["amount"].transform("sum")
    df["category_ratio"] = cat_totals / df["amount"].sum()
    return df
