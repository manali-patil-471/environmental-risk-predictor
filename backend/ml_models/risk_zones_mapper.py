from typing import Dict, Any, List


def categorize_aqi(aqi: float) -> str:
    """
    Map AQI value to a human-readable risk category.
    Thresholds are example values based on common AQI scales.
    """
    if aqi <= 50:
        return "good"
    elif aqi <= 100:
        return "satisfactory"
    elif aqi <= 200:
        return "moderate"
    elif aqi <= 300:
        return "poor"
    elif aqi <= 400:
        return "very_poor"
    else:
        return "severe"


def enrich_station_with_risk(station: Dict[str, Any]) -> Dict[str, Any]:
    """
    Adds categorical risk levels for current and predicted AQI.
    Expects keys:
      - 'overall_aqi'
      - optionally 'predicted_aqi_next_6h'
    """
    enriched = dict(station)

    current_aqi = station.get("overall_aqi", 0) or 0
    enriched["current_risk_level"] = categorize_aqi(float(current_aqi))

    if "predicted_aqi_next_6h" in station and station["predicted_aqi_next_6h"] is not None:
        enriched["predicted_risk_level_next_6h"] = categorize_aqi(
            float(station["predicted_aqi_next_6h"])
        )
    else:
        enriched["predicted_risk_level_next_6h"] = None

    return enriched


def enrich_all_stations_with_risk(stations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Add risk levels to a list of stations.
    """
    return [enrich_station_with_risk(s) for s in stations]