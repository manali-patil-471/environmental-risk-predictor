import os
import time
from typing import Optional, List, Dict

import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("CPCB_API_KEY")
BASE_URL = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"


def get_live_data(state: str = "Maharashtra", limit: int = 10) -> Optional[pd.DataFrame]:
    """
    Fetch live data from CPCB API.

    Args:
        state: State name. If empty/None, fetches all India.
        limit: Approximate number of raw records to fetch (in batches of 10).

    Returns:
        DataFrame with air quality data, or None if error / no data.
    """
    location = state if state else "all India"
    print(f"🔄 Fetching fresh data from CPCB API for {location}...")

    all_records: List[Dict] = []
    offset = 0
    # Max number of 10-record batches to request
    max_fetch_attempts = max(1, min(50, (limit // 10) + 1))

    try:
        for attempt in range(max_fetch_attempts):
            params = {
                "api-key": API_KEY,
                "format": "json",
                "limit": 10,
                "offset": offset,
            }
            if state:
                params["filters[state]"] = state

            print(
                f"  Attempt {attempt + 1}/{max_fetch_attempts}: "
                f"Fetching records {offset} to {offset + 10}..."
            )

            try:
                response = requests.get(BASE_URL, params=params, timeout=15)
                response.raise_for_status()

                data = response.json()
                records = data.get("records", [])

                if not records:
                    print(f"  ℹ️ No more records available at offset {offset}")
                    break

                all_records.extend(records)
                print(f"  ✓ Got {len(records)} records in this batch")
                offset += 10

                # Wait between requests to avoid overwhelming the API
                time.sleep(1)

                if len(all_records) >= limit:
                    print(f"  ✓ Reached limit of {limit} records")
                    break

            except requests.exceptions.Timeout:
                print(f"  ⚠️ Request timeout on attempt {attempt + 1}. Retrying...")
                time.sleep(2)
                continue
            except requests.exceptions.RequestException as e:
                print(f"  ⚠️ Request error: {e}. Retrying...")
                time.sleep(2)
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
        return None

    except Exception as e:
        print(f"❌ Unexpected error: {type(e).__name__}: {e}")
        return None