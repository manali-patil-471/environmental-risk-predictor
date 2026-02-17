import json
import pandas as pd
import numpy as np
from datetime import datetime
from data_cleaner import clean_and_pivot_aqdata

def generate_mock_air_quality_data(num_stations: int = 10) -> pd.DataFrame:
    """
    Generate realistic mock air quality data in the SAME FORMAT as the live CPCB API.
    
    This ensures the data cleaning pipeline works for both mock and live data.
    
    Returns:
        DataFrame with columns matching CPCB API format:
        ['country', 'state', 'city', 'station', 'last_update', 'latitude', 'longitude', 
         'pollutant_id', 'min_value', 'max_value', 'avg_value']
    """
    
    # Real Maharashtra cities (sample)
    cities = [
        "Mumbai", "Pune", "Nagpur", "Aurangabad", "Nashik",
        "Solapur", "Kolhapur", "Nanded", "Jalgaon", "Ahmednagar"
    ]
    
    pollutants = ["PM2.5", "PM10", "NO2", "SO2", "CO"]
    
    # Realistic pollutant ranges
    pollutant_ranges = {
        "PM2.5": (10, 150),
        "PM10": (20, 250),
        "NO2": (20, 150),
        "SO2": (10, 100),
        "CO": (0.5, 5)
    }
    
    records = []
    
    for i in range(num_stations):
        city = cities[i % len(cities)]
        station_name = f"{city}-Station-{i+1}"
        
        # Generate realistic coordinates (rough bounds of Maharashtra)
        latitude = np.random.uniform(16.5, 22.0)
        longitude = np.random.uniform(72.5, 80.0)
        
        # Generate pollutant data for this station
        # Each pollutant gets its own row (like real API)
        for pollutant in pollutants:
            min_val, max_val = pollutant_ranges[pollutant]
            
            # Create realistic pollution values
            avg_val = np.random.uniform(min_val, max_val)
            min_pollutant = avg_val * 0.7  # Min is ~70% of average
            max_pollutant = avg_val * 1.3  # Max is ~130% of average
            
            records.append({
                "country": "India",
                "state": "Maharashtra",
                "city": city,
                "station": station_name,
                "last_update": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                "latitude": round(latitude, 6),
                "longitude": round(longitude, 6),
                "pollutant_id": pollutant,  # ← IMPORTANT: Match API format
                "min_value": round(min_pollutant, 2),
                "max_value": round(max_pollutant, 2),
                "avg_value": round(avg_val, 2)
            })
    
    return pd.DataFrame(records)

def save_mock_data_json(output_file: str = "mock_data.json"):
    """
    Generate mock data, clean it, and save as JSON for frontend team.
    
    Args:
        output_file: Path to output JSON file
    """
    print("🌍 Generating mock air quality data (in CPCB API format)...")
    
    # Generate raw mock data in LIVE API format
    raw_data = generate_mock_air_quality_data(num_stations=10)
    print(f"✓ Generated {len(raw_data)} raw data records")
    print(f"  Columns: {list(raw_data.columns)}")
    
    # Clean and pivot the data
    cleaned_data = clean_and_pivot_aqdata(raw_data)
    print(f"✓ Cleaned and pivoted into {len(cleaned_data)} stations")
    
    # Convert to JSON format
    data_json = cleaned_data.to_dict(orient="records")
    
    # Create final output structure
    output = {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "state": "Maharashtra",
        "count": len(data_json),
        "data": data_json,
        "metadata": {
            "source": "mock-generator",
            "note": "This is mock data in the same format as live CPCB API. Use /live-data endpoint for real data.",
            "pollutants_included": ["PM2.5", "PM10", "NO2", "SO2", "CO"],
            "cache_duration_seconds": 600
        }
    }
    
    # Save to JSON file
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"✓ Saved mock data to {output_file}")
    print(f"\nMock Data Summary:")
    print(f"  - Total Stations: {output['count']}")
    print(f"  - Timestamp: {output['timestamp']}")
    print(f"  - File Size: {len(json.dumps(output)) / 1024:.2f} KB")
    
    return output

def create_frontend_ready_mock_data(output_file: str = "mock_data.json"):
    """
    Convenience function to generate and save mock data.
    Frontend teams can import this directly.
    """
    return save_mock_data_json(output_file)

if __name__ == "__main__":
    # Run this script to generate mock data
    create_frontend_ready_mock_data("mock_data.json")
    
    # Optional: Also display a sample
    print("\n📋 Sample Station Data:")
    import json
    with open("mock_data.json", 'r') as f:
        data = json.load(f)
        if data["data"]:
            print(json.dumps(data["data"][0], indent=2))