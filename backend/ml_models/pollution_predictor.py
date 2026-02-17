from pathlib import Path
from typing import Dict, Any, List

import pandas as pd
import pickle

from ml_models.train_model import FEATURE_COLUMNS, DEFAULT_MODEL_PATH
from weather_fetcher import fetch_weather

class PollutionPredictor:
    def __init__(self, model_path: Path = None):
        path = Path(model_path) if model_path else DEFAULT_MODEL_PATH
        if not path.exists():
            raise FileNotFoundError(f"Model not found: {path}")
        with path.open("rb") as f:
            self.model = pickle.load(f)

    def _build_features(self, station: Dict[str, Any], weather: Dict[str, Any], hour: int) -> Dict[str, float]:
        out = {}
        for col in FEATURE_COLUMNS:
            if col == "hour":
                out[col] = float(hour)
            elif col in weather and weather[col] is not None:
                out[col] = float(weather[col])
            elif col in station and station[col] is not None:
                try:
                    out[col] = float(station[col])
                except (TypeError, ValueError):
                    out[col] = 0.0
            else:
                out[col] = 0.0
        return out

    def predict_for_station(self, station: Dict[str, Any], hour: int) -> float:
        lat = station.get("latitude") or 0
        lon = station.get("longitude") or 0
        weather = fetch_weather(lat, lon) or {}
        feats = self._build_features(station, weather, hour)
        df = pd.DataFrame([feats], columns=FEATURE_COLUMNS)
        return float(self.model.predict(df)[0])

    def predict_for_stations(self, stations: List[Dict[str, Any]], hour: int) -> List[float]:
        return [self.predict_for_station(s, hour) for s in stations]