import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from .features import build_features
import os

def train_model(transactions_path: str, model_path: str):
    df = pd.read_csv(transactions_path)
    features_df = build_features(df.to_dict(orient="records"))
    # Use last 30 days for training
    features_df = features_df.dropna()
    X = features_df[[
        "avg_daily_spend", "last_7_days_spend", "last_14_days_spend",
        "spend_trend_slope", "spend_velocity", "spend_variance",
        "momentum", "weekend_ratio"
    ]]
    y = features_df["daily_spend"]
    model = LinearRegression()
    model.fit(X, y)
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    return model
