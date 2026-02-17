import argparse
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import pickle

FEATURE_COLUMNS = [
    "PM2.5", "PM10", "NO2", "SO2", "CO",
    "temperature_2m", "relative_humidity_2m", "wind_speed_10m",
    "wind_direction_10m", "surface_pressure", "hour"
]
TARGET_COLUMN = "target_aqi_next_6h"
DEFAULT_MODEL_PATH = Path(__file__).with_name("pollution_rf.pkl")

def load_dataset(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    for c in FEATURE_COLUMNS:
        if c not in df.columns:
            raise ValueError(f"Missing column: {c}")
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Missing target: {TARGET_COLUMN}")
    df = df.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN])
    df[FEATURE_COLUMNS] = df[FEATURE_COLUMNS].fillna(0)
    return df

def train_model(df: pd.DataFrame) -> RandomForestRegressor:
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    X_train, X_valid, y_train, y_valid = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    mae = mean_absolute_error(y_valid, model.predict(X_valid))
    print(f"Validation MAE: {mae:.2f} AQI points")
    return model

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="data/historical_aqi.csv")
    parser.add_argument("--out", type=str, default=str(DEFAULT_MODEL_PATH))
    args = parser.parse_args()

    print(f"📂 Loading {args.data}...")
    df = load_dataset(args.data)
    print(f"✓ {len(df)} rows")

    print("🧠 Training...")
    model = train_model(df)

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "wb") as f:
        pickle.dump(model, f)
    print(f"✓ Saved to {args.out}")

if __name__ == "__main__":
    main()