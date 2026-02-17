from typing import Dict, Any, List, Optional

# Try to import ML model, fallback to rule-based if not available
try:
    from .source_identifier_ml import SourceIdentifierML
    ML_AVAILABLE = True
    ml_classifier = None
except ImportError:
    ML_AVAILABLE = False
    ml_classifier = None


def identify_source_for_station(station: Dict[str, Any]) -> str:
    """
    Heuristic source identification based on pollutant pattern.

    NOTE: This is a simplified rule-based version. In reality, you would
    train a model on labeled data (industry / construction / traffic / other).
    """
    pm25 = station.get("PM2.5") or 0.0
    pm10 = station.get("PM10") or 0.0
    no2 = station.get("NO2") or 0.0
    so2 = station.get("SO2") or 0.0
    co = station.get("CO") or 0.0
    ozone = station.get("OZONE") or 0.0
    overall_aqi = station.get("overall_aqi") or 0.0

    # Basic ratios
    pm_ratio = pm10 / pm25 if pm25 > 0 else 1.0

    # Rules (adjusted for current data patterns):
    # 1) High NO2 & CO with moderate PM -> Traffic
    if no2 > 20 and co > 15 and pm25 < 150 and pm_ratio < 2.5:
        return "traffic"

    # 2) High PM10, high PM ratio, not too high NO2/SO2 -> Construction/Road dust
    if pm10 > 70 and pm_ratio > 2.0 and no2 < 80 and so2 < 80:
        return "construction_or_road_dust"

    # 3) Moderate SO2 & NO2 -> Industry / power plant
    if so2 > 10 and no2 > 15:
        return "industry"

    # 4) Moderately elevated PM10 or OZONE -> urban background / residential
    if (pm25 > 30 and pm10 < 200 and no2 < 80) or (ozone > 50 and pm10 < 150):
        return "urban_background"

    # 5) Low pollution with some OZONE -> background/natural
    if ozone > 30 and overall_aqi < 80:
        return "background_natural"

    # 6) Very low overall AQI -> clean background
    if overall_aqi < 40:
        return "clean_background"

    # 7) Moderate PM10 without PM2.5 data -> mixed sources
    if pm10 > 50 and pm10 < 100 and pm25 == 0:
        return "mixed_sources"

    # Default fallback
    return "unknown"


def identify_sources_for_stations(stations: List[Dict[str, Any]], use_ml: bool = True) -> List[Dict[str, Any]]:
    """
    Attach a 'likely_source' field to each station dictionary.
    Uses ML model if available and requested, otherwise falls back to rules.
    """
    global ml_classifier
    
    # Initialize ML classifier if needed
    if use_ml and ML_AVAILABLE and ml_classifier is None:
        try:
            ml_classifier = SourceIdentifierML()
        except:
            ml_classifier = None
    
    # Use ML if available and requested
    if use_ml and ml_classifier is not None:
        try:
            sources = ml_classifier.predict_sources_for_stations(stations)
            enriched = []
            for station, source in zip(stations, sources):
                s_copy = dict(station)
                s_copy["likely_source"] = source
                s_copy["source_method"] = "ml"
                enriched.append(s_copy)
            return enriched
        except Exception as e:
            print(f"⚠️ ML prediction failed, falling back to rules: {e}")
    
    # Fallback to rule-based
    enriched = []
    for s in stations:
        s_copy = dict(s)
        s_copy["likely_source"] = identify_source_for_station(s)
        s_copy["source_method"] = "rules"
        enriched.append(s_copy)
    return enriched