from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, Response
import asyncio
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
import json
import numpy as np
import pandas as pd
from fetcher import get_live_data
from data_cleaner import clean_and_pivot_aqdata
from ml_models.risk_zones_mapper import enrich_all_stations_with_risk
from ml_models.source_identifier import identify_sources_for_stations
from ml_models.pollution_predictor import PollutionPredictor
from fastapi.middleware.cors import CORSMiddleware

# Import new modules
from models.user_models import UserProfile, HealthAdvice, NotificationMessage, EcoCredit, MunicipalRequest
from services.personalized_health import PersonalizedHealthEngine
from services.municipal_alerts import MunicipalAlertSystem
from services.eco_credits import EcoCreditsSystem

# Custom JSON Encoder to handle NaN and Inf values
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.nan) or (isinstance(obj, float) and np.isnan(obj)):
            return None
        if isinstance(obj, np.inf) or (isinstance(obj, float) and np.isinf(obj)):
            return None
        if isinstance(obj, (np.integer, np.floating)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return super().default(obj)

app = FastAPI(
    title="EcoNova Sentinel Backend",
    description="AI-based environmental risk prediction system",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache storage (now includes state)
cache_store: Dict[str, Any] = {
    "data": None,
    "timestamp": 0,
    "is_loading": False,
    "state": None,
}

CACHE_DURATION = 600  # 10 minutes in seconds

try:
    predictor = PollutionPredictor()
except FileNotFoundError:
    predictor = None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "EcoNova Sentinel Backend is Live",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "cache_status": {
            "is_cached": cache_store["data"] is not None,
            "cache_age_seconds": time.time() - cache_store["timestamp"],
            "is_loading": cache_store["is_loading"],
            "state": cache_store["state"],
        }
    }


def sanitize_dataframe_for_json(df):
    """
    Convert DataFrame to list of dicts, replacing all NaN/Inf with None
    to ensure JSON serialization works.
    """
    records = []
    for _, row in df.iterrows():
        record = {}
        for col, val in row.items():
            # Replace NaN, Inf, and other problematic values with None
            if pd.isna(val) or (isinstance(val, float) and np.isinf(val)):
                record[col] = None
            elif isinstance(val, (np.integer, np.floating)):
                record[col] = float(val)
            else:
                record[col] = val
        records.append(record)
    return records


async def fetch_and_clean_data(state: str = "Maharashtra") -> Optional[Dict[str, Any]]:
    """
    Async wrapper to fetch data from API and clean it.
    Prevents concurrent API calls using is_loading flag.
    Caches results PER STATE.
    """
    # If another request is already fetching, wait for it
    while cache_store["is_loading"]:
        await asyncio.sleep(0.1)

    # Check if cache for this state is still valid after waiting
    if (
        cache_store["data"] is not None
        and cache_store["state"] == state
        and (time.time() - cache_store["timestamp"]) < CACHE_DURATION
    ):
        print(
            f"✓ Returning cached data for {state} "
            f"(age: {time.time() - cache_store['timestamp']:.1f}s)"
        )
        return cache_store["data"]

    # Mark as loading
    cache_store["is_loading"] = True

    try:
        print(f"🔄 Fetching fresh data for: {state}")
        # Fetch raw data from government API (blocking I/O in thread)
        loop = asyncio.get_event_loop()
        raw_df = await loop.run_in_executor(None, get_live_data, state)

        if raw_df is None:
            print("❌ get_live_data() returned None - API call failed")
            return None

        if raw_df.empty:
            print("❌ get_live_data() returned empty DataFrame")
            return None

        print(f"✓ Got {len(raw_df)} raw records from API")
        print(f"  Columns: {list(raw_df.columns)}")

        # Clean and pivot data
        print(f"🔄 Cleaning and pivoting data...")
        cleaned_df = clean_and_pivot_aqdata(raw_df)

        if cleaned_df.empty:
            print("❌ Cleaned DataFrame is empty")
            return None

        print(f"✓ Cleaned into {len(cleaned_df)} stations")
        print(f"  Columns: {list(cleaned_df.columns)}")

        # CRITICAL: Sanitize DataFrame to remove NaN/Inf before JSON conversion
        print(f"🔄 Sanitizing data for JSON serialization...")
        data_json = sanitize_dataframe_for_json(cleaned_df)

        result = {
            "count": len(data_json),
            "data": data_json,
            "timestamp": datetime.now().isoformat(),
            "state": state,
        }

        # Update cache FOR THIS STATE
        cache_store["data"] = result
        cache_store["timestamp"] = time.time()
        cache_store["state"] = state

        print(f"✓ Data cached successfully for {state}")
        return result

    except Exception as e:
        print(f"❌ Error fetching/cleaning data: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return None

    finally:
        cache_store["is_loading"] = False


@app.get("/live-data")
async def live_data(state: str = ""):
    """
    Returns real-time, cleaned air quality data as JSON for the frontend.

    Query Parameters:
    - state: State name (default: "" for all India)

    Response:
    - count: Number of stations
    - data: Array of cleaned station data with AQI
    - timestamp: When data was fetched
    """
    try:
        result = await fetch_and_clean_data(state)

        if result is None:
            raise HTTPException(
                status_code=503,
                detail="Could not fetch data from CPCB API. Service temporarily unavailable."
            )

        # Enrich each station with risk category and likely source
        stations = result.get("data", [])
        stations_with_risk = enrich_all_stations_with_risk(stations)
        stations_with_sources = identify_sources_for_stations(stations_with_risk, use_ml=True)
        result["data"] = stations_with_sources

        # Add cache metadata
        cache_age = time.time() - cache_store["timestamp"]
        result["cache_age_seconds"] = round(cache_age, 2)
        result["cached"] = cache_age < CACHE_DURATION

        # Use custom encoder for JSON response
        json_str = json.dumps(result, cls=NumpyEncoder)
        return Response(content=json_str, media_type="application/json")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in /live-data: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/live-data/{station_id}")
async def get_station_data(station_id: str, state: str = ""):
    """
    Get data for a specific station.

    Path Parameters:
    - station_id: Station identifier
    """
    try:
        result = await fetch_and_clean_data(state)

        if result is None:
            raise HTTPException(status_code=503, detail="No data available")

        # Filter for specific station
        station_data = [s for s in result["data"] if s.get("station") == station_id]

        if not station_data:
            raise HTTPException(
                status_code=404,
                detail=f"Station '{station_id}' not found"
            )

        response_data = {
            "station": station_data[0],
            "timestamp": result["timestamp"]
        }

        json_str = json.dumps(response_data, cls=NumpyEncoder)
        return Response(content=json_str, media_type="application/json")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/cache-stats")
async def cache_statistics():
    """Returns cache performance statistics"""
    age = time.time() - cache_store["timestamp"]
    return {
        "cache_size_mb": len(str(cache_store["data"])) / 1024 / 1024 if cache_store["data"] else 0,
        "cache_age_seconds": round(age, 2),
        "is_valid": age < CACHE_DURATION,
        "records_cached": cache_store["data"]["count"] if cache_store["data"] else 0,
        "state": cache_store["state"],
        "is_currently_loading": cache_store["is_loading"],
    }


@app.get("/mock-data")
async def get_mock_data(num_stations: int = 10):
    """
    Returns mock air quality data for frontend testing.
    Useful when the live API is unavailable.
    """
    try:
        from generate_mock_data import generate_mock_air_quality_data
        raw_data = generate_mock_air_quality_data(num_stations=num_stations)
        cleaned_data = clean_and_pivot_aqdata(raw_data)

        # Sanitize before JSON conversion
        data_json = sanitize_dataframe_for_json(cleaned_data)

        response_data = {
            "status": "success",
            "source": "mock-generator",
            "count": len(data_json),
            "data": data_json,
            "timestamp": datetime.now().isoformat(),
            "note": "This is mock data for development purposes"
        }

        json_str = json.dumps(response_data, cls=NumpyEncoder)
        return Response(content=json_str, media_type="application/json")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/predict")
async def predict(state: str = ""):
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Model not trained. Run: python -m ml_models.train_model"
        )

    result = await fetch_and_clean_data(state)
    if result is None:
        raise HTTPException(status_code=503, detail="Could not fetch CPCB data")

    stations = result["data"]
    hour = datetime.now().hour
    preds = predictor.predict_for_stations(stations, hour)

    from ml_models.risk_zones_mapper import enrich_all_stations_with_risk
    from ml_models.source_identifier import identify_sources_for_stations

    enriched = [dict(s) for s in stations]
    for i, p in enumerate(preds):
        enriched[i]["predicted_aqi_next_6h"] = p

    enriched = enrich_all_stations_with_risk(enriched)
    enriched = identify_sources_for_stations(enriched, use_ml=True)

    return {
        "count": len(enriched),
        "data": enriched,
        "timestamp": datetime.now().isoformat(),
        "state": state,
    }


# Initialize new services
health_engine = PersonalizedHealthEngine()
alert_system = MunicipalAlertSystem()
eco_system = EcoCreditsSystem()


@app.post("/health-advice")
async def get_personalized_health_advice(user_profile: UserProfile, state: str = ""):
    """
    Get personalized health advice based on user profile and current air quality.
    """
    try:
        result = await fetch_and_clean_data(state)
        if result is None:
            raise HTTPException(status_code=503, detail="Could not fetch air quality data")
        
        # Find nearest station to user
        stations = result["data"]
        nearest_station = None
        min_distance = float('inf')
        
        for station in stations:
            distance = ((user_profile.location_lat - station["latitude"]) ** 2 + 
                       (user_profile.location_lon - station["longitude"]) ** 2) ** 0.5
            if distance < min_distance:
                min_distance = distance
                nearest_station = station
        
        if not nearest_station:
            raise HTTPException(status_code=404, detail="No nearby monitoring station found")
        
        # Generate personalized health advice
        aqi = int(nearest_station.get("overall_aqi", 0))
        health_advice = health_engine.generate_health_advice(aqi, user_profile)
        
        return {
            "user_id": user_profile.user_id,
            "location": {
                "latitude": user_profile.location_lat,
                "longitude": user_profile.location_lon,
                "city": user_profile.city
            },
            "nearest_station": {
                "name": nearest_station.get("station"),
                "aqi": aqi,
                "risk_level": nearest_station.get("current_risk_level")
            },
            "health_advice": health_advice.dict(),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/municipal-alerts")
async def trigger_municipal_alerts(state: str = ""):
    """
    Check for high-risk zones and automatically raise municipal requests.
    """
    try:
        result = await fetch_and_clean_data(state)
        if result is None:
            raise HTTPException(status_code=503, detail="Could not fetch air quality data")
        
        stations = result["data"]
        
        # Generate municipal alerts for high-risk zones
        alerts = alert_system.check_and_raise_alerts(stations)
        
        # Send alerts to authorities
        sent_alerts = []
        for alert in alerts:
            success = alert_system.send_municipal_request(alert)
            sent_alerts.append({
                "request_id": alert.request_id,
                "sent": success,
                "authority": alert.authority_type,
                "urgency": alert.urgency
            })
        
        return {
            "total_alerts": len(alerts),
            "sent_successfully": len([a for a in sent_alerts if a["sent"]]),
            "alerts": sent_alerts,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/eco-credits/submit")
async def submit_eco_action(user_id: str, action_type: str, description: str,
                         photo_url: Optional[str] = None, location_lat: Optional[float] = None,
                         location_lon: Optional[float] = None):
    """
    Submit an eco-action to earn credits.
    """
    try:
        eco_credit = eco_system.submit_eco_action(
            user_id=user_id,
            action_type=action_type,
            description=description,
            photo_url=photo_url,
            location_lat=location_lat,
            location_lon=location_lon
        )
        
        return {
            "success": True,
            "eco_credit": eco_credit.dict(),
            "message": f"Eco-action submitted successfully! Earned {eco_credit.credits_earned} credits."
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/eco-credits/{user_id}")
async def get_user_eco_credits(user_id: str):
    """
    Get total eco credits and breakdown for a user.
    """
    try:
        credits_data = eco_system.get_user_credits(user_id)
        return credits_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/eco-credits/leaderboard")
async def get_eco_leaderboard(limit: int = 10):
    """
    Get top users by eco credits.
    """
    try:
        leaderboard = eco_system.get_leaderboard(limit)
        return {
            "leaderboard": leaderboard,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/eco-credits/actions")
async def get_available_eco_actions():
    """
    Get list of available eco actions and their credit values.
    """
    try:
        actions = eco_system.get_available_actions()
        return actions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/notifications/generate")
async def generate_citizen_notifications(user_profiles: List[Dict], state: str = ""):
    """
    Generate personalized notifications for citizens based on pollution forecasts.
    """
    try:
        result = await fetch_and_clean_data(state)
        if result is None:
            raise HTTPException(status_code=503, detail="Could not fetch air quality data")
        
        stations = result["data"]
        notifications = alert_system.generate_citizen_notifications(stations, user_profiles)
        
        return {
            "total_notifications": len(notifications),
            "notifications": [n.dict() for n in notifications],
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")