import requests
import time
from typing import Dict, Any, Optional

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

def fetch_weather(lat: float, lon: float, max_retries: int = 3) -> Optional[Dict[str, Any]]:
    """
    Fetch current weather from Open-Meteo. Retries on failure.
    """
    for attempt in range(max_retries):
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure",
                "timezone": "Asia/Kolkata",
            }
            r = requests.get(OPEN_METEO_URL, params=params, timeout=15)
            r.raise_for_status()
            data = r.json()
            curr = data.get("current", {})
            return {
                "temperature_2m": curr.get("temperature_2m"),
                "relative_humidity_2m": curr.get("relative_humidity_2m"),
                "wind_speed_10m": curr.get("wind_speed_10m"),
                "wind_direction_10m": curr.get("wind_direction_10m"),
                "surface_pressure": curr.get("surface_pressure"),
            }
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return None
    return None