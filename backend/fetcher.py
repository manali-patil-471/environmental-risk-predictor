import os
import time
from typing import Optional, List, Dict

import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("CPCB_API_KEY")
BASE_URL = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
<<<<<<< HEAD


def get_live_data(state: str = "Maharashtra", limit: int = 10) -> Optional[pd.DataFrame]:
=======
OPENAQ_URL = "https://api.openaq.org/v2/latest"


def get_live_data(state: str = "", limit: int = 500, city: str = "") -> Optional[pd.DataFrame]:
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
    """
    Fetch live data from CPCB API.

    Args:
        state: State name. If empty/None, fetches all India.
<<<<<<< HEAD
        limit: Approximate number of raw records to fetch (in batches of 10).
=======
        limit: Approximate number of raw records to fetch (in batches of 10). Set to 500+ for all stations.
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)

    Returns:
        DataFrame with air quality data, or None if error / no data.
    """
<<<<<<< HEAD
    location = state if state else "all India"
=======
    location = city if city else (state if state else "all India")
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
    print(f"🔄 Fetching fresh data from CPCB API for {location}...")

    all_records: List[Dict] = []
    offset = 0
<<<<<<< HEAD
    # Max number of 10-record batches to request
    max_fetch_attempts = max(1, min(50, (limit // 10) + 1))

    try:
        for attempt in range(max_fetch_attempts):
            params = {
                "api-key": API_KEY,
                "format": "json",
                "limit": 10,
=======
    start_time = time.monotonic()
    max_total_seconds = 20
    batch_size = 100
    # Max number of batches to request
    max_fetch_attempts = max(1, min(20, (limit // batch_size) + 1))

    try:
        for attempt in range(max_fetch_attempts):
            if (time.monotonic() - start_time) > max_total_seconds:
                print("  ! CPCB fetch budget exceeded, switching to fallback")
                break
            params = {
                "api-key": API_KEY,
                "format": "json",
                "limit": batch_size,
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
                "offset": offset,
            }
            if state:
                params["filters[state]"] = state
<<<<<<< HEAD

            print(
                f"  Attempt {attempt + 1}/{max_fetch_attempts}: "
                f"Fetching records {offset} to {offset + 10}..."
            )

            try:
                response = requests.get(BASE_URL, params=params, timeout=15)
=======
            if city:
                params["filters[city]"] = city

            print(
                f"  Attempt {attempt + 1}/{max_fetch_attempts}: "
                f"Fetching records {offset} to {offset + batch_size}..."
            )

            try:
                response = requests.get(BASE_URL, params=params, timeout=6)
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
                response.raise_for_status()

                data = response.json()
                records = data.get("records", [])

                if not records:
                    print(f"  ℹ️ No more records available at offset {offset}")
                    break

                all_records.extend(records)
                print(f"  ✓ Got {len(records)} records in this batch")
<<<<<<< HEAD
                offset += 10

                # Wait between requests to avoid overwhelming the API
                time.sleep(1)
=======
                offset += batch_size

                # Keep a short delay to avoid hammering API while keeping UI responsive.
                time.sleep(0.1)
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)

                if len(all_records) >= limit:
                    print(f"  ✓ Reached limit of {limit} records")
                    break

            except requests.exceptions.Timeout:
                print(f"  ⚠️ Request timeout on attempt {attempt + 1}. Retrying...")
<<<<<<< HEAD
                time.sleep(2)
                continue
            except requests.exceptions.RequestException as e:
                print(f"  ⚠️ Request error: {e}. Retrying...")
                time.sleep(2)
=======
                time.sleep(0.5)
                continue
            except requests.exceptions.HTTPError as e:
                status = e.response.status_code if e.response is not None else None
                print(f"  HTTP error: {e}")
                if status is not None and 400 <= status < 500:
                    break
                time.sleep(0.5)
                continue
            except requests.exceptions.RequestException as e:
                print(f"  ⚠️ Request error: {e}. Retrying...")
                time.sleep(0.5)
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
                continue

        if all_records:
            df = pd.DataFrame(all_records)
            print(f"\n✓ Successfully fetched {len(df)} total records")
            print(f"  Columns: {list(df.columns)}")
            if "city" in df.columns:
                print(f"  Unique cities: {df['city'].nunique()}")
            if "station" in df.columns:
                print(f"  Unique stations: {df['station'].nunique()}")
            return df

        print("❌ Could not fetch any records")
<<<<<<< HEAD
        return None

    except Exception as e:
        print(f"❌ Unexpected error: {type(e).__name__}: {e}")
        return None
=======
        # Fallback to OpenAQ public API (no API key required)
        print("🔁 Falling back to OpenAQ public API...")
        try:
            return get_live_data_openaq(state=state, limit=limit)
        except Exception as e:
            print(f"❌ OpenAQ fallback failed: {e}")
            return None

    except Exception as e:
        print(f"❌ Unexpected error: {type(e).__name__}: {e}")
        return None


def get_live_data_openaq(state: str = "", limit: int = 50) -> Optional[pd.DataFrame]:
    """
    Fetch recent measurements from OpenAQ (public, no API key required).

    Returns a DataFrame similar to CPCB raw records so the existing
    cleaning pipeline can pivot it into station rows.
    """
    try:
        params = {
            "country": "IN",
            "limit": limit,
        }
        # OpenAQ doesn't support filtering by Indian state reliably; keep city filtering commented
        # if state: params["city"] = state

        print(f"🔄 Fetching latest data from OpenAQ (India), limit={limit}...")
        resp = requests.get(OPENAQ_URL, params=params, timeout=15)
        resp.raise_for_status()
        payload = resp.json()
        results = payload.get("results", [])

        records = []
        for loc in results:
            station = loc.get("location") or loc.get("name") or "unknown"
            city = loc.get("city") or ""
            coords = loc.get("coordinates") or {}
            lat = coords.get("latitude")
            lon = coords.get("longitude")

            measurements = loc.get("measurements", [])
            for m in measurements:
                param = m.get("parameter") or ""
                # Normalize parameter names to match expected pollutant ids
                param_map = {
                    "pm25": "PM2.5",
                    "pm10": "PM10",
                    "no2": "NO2",
                    "so2": "SO2",
                    "co": "CO",
                    "o3": "OZONE",
                }
                pollutant_id = param_map.get(param.lower(), param.upper())
                value = m.get("value")

                records.append({
                    "station": station,
                    "city": city,
                    "latitude": lat,
                    "longitude": lon,
                    "pollutant_id": pollutant_id,
                    "avg_value": value,
                })

        if records:
            df = pd.DataFrame(records)
            print(f"✓ OpenAQ: fetched {len(df)} measurement rows")
            return df

        print("❌ OpenAQ returned no results")
        return None

    except Exception as e:
        print(f"❌ OpenAQ fetch error: {e}")
        return None

>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
