import os
import sys
import time
import requests
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from data_cleaner import clean_and_pivot_aqdata
from weather_fetcher import fetch_weather

load_dotenv()
API_KEY = os.getenv("CPCB_API_KEY")
BASE_URL = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"

def fetch_all_cpcb() -> pd.DataFrame:
    """Paginate through CPCB API to get ALL stations for the state."""
    all_records = []
    offset = 0
    limit_per_request = 50
    timeout_seconds = 45
    max_retries = 3
    delay_between_requests = 2

    while True:
        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": limit_per_request,
            "offset": offset,
        }
        records = []
        for attempt in range(max_retries):
            try:
                r = requests.get(BASE_URL, params=params, timeout=timeout_seconds)
                r.raise_for_status()
                data = r.json()
                records = data.get("records", [])
                break
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                print(f"  ⚠️ Attempt {attempt + 1}/{max_retries} failed at offset {offset}: {e}")
                if attempt < max_retries - 1:
                    time.sleep(3)
                else:
                    print(f"  ❌ Giving up at offset {offset}")
                    return pd.DataFrame(all_records) if all_records else pd.DataFrame()
            except Exception as e:
                print(f"  ❌ Error at offset {offset}: {e}")
                return pd.DataFrame(all_records) if all_records else pd.DataFrame()

        if not records:
            break
        all_records.extend(records)
        print(f"  Fetched {len(records)} records (total: {len(all_records)})")
        if len(records) < limit_per_request:
            break
        offset += limit_per_request
        time.sleep(delay_between_requests)

    return pd.DataFrame(all_records)

def main():
    output_path = "data/historical_aqi.csv"

    print("📡 Fetching all CPCB data for India...")
    raw_df = fetch_all_cpcb()
    if raw_df.empty:
        print("❌ No CPCB data received. Check API key and connection.")
        sys.exit(1)

    print("🧹 Cleaning and pivoting...")
    cleaned_df = clean_and_pivot_aqdata(raw_df)
    if cleaned_df.empty:
        print("❌ Cleaned data is empty.")
        sys.exit(1)

    now = datetime.now()
    hour = now.hour
    timestamp_str = now.isoformat()

    # Add weather and target columns
    rows = []
    seen_coords = {}
    for idx, row in cleaned_df.iterrows():
        lat = float(row["latitude"])
        lon = float(row["longitude"])
        key = (round(lat, 2), round(lon, 2))
        if key not in seen_coords:
            w = fetch_weather(lat, lon)
            if w is None:
                # Fallback so we don't have empty values
                w = {
                    "temperature_2m": 27.0,
                    "relative_humidity_2m": 60.0,
                    "wind_speed_10m": 5.0,
                    "wind_direction_10m": 180.0,
                    "surface_pressure": 1013.0,
                }
            seen_coords[key] = w
            time.sleep(0.5)
        weather = seen_coords.get(key) or {}

        # Fill missing pollutants with 0
        pm25 = row.get("PM2.5") if pd.notna(row.get("PM2.5")) else 0
        pm10 = row.get("PM10") if pd.notna(row.get("PM10")) else 0
        no2 = row.get("NO2") if pd.notna(row.get("NO2")) else 0
        so2 = row.get("SO2") if pd.notna(row.get("SO2")) else 0
        co = row.get("CO") if pd.notna(row.get("CO")) else 0
        aqi = float(row.get("overall_aqi", 0) or 0)

        rows.append({
            "station": row["station"],
            "city": row["city"],
            "latitude": lat,
            "longitude": lon,
            "PM2.5": pm25,
            "PM10": pm10,
            "NO2": no2,
            "SO2": so2,
            "CO": co,
            "overall_aqi": aqi,
            "temperature_2m": weather.get("temperature_2m"),
            "relative_humidity_2m": weather.get("relative_humidity_2m"),
            "wind_speed_10m": weather.get("wind_speed_10m"),
            "wind_direction_10m": weather.get("wind_direction_10m"),
            "surface_pressure": weather.get("surface_pressure"),
            "hour": hour,
            "target_aqi_next_6h": aqi,
            "timestamp": timestamp_str,
        })

    out_df = pd.DataFrame(rows)
    os.makedirs("data", exist_ok=True)
    out_df.to_csv(output_path, index=False)
    print(f"✅ Saved {len(out_df)} rows to {output_path}")

if __name__ == "__main__":
    main()