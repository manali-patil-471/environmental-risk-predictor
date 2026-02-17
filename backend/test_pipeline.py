"""
Test the data cleaning pipeline with mock data
Run this to verify everything works before hitting the real API
"""
import sys
sys.path.insert(0, '/path/to/backend')

from generate_mock_data import generate_mock_air_quality_data
from data_cleaner import clean_and_pivot_aqdata
import json

# Generate mock data
print("📊 Generating mock data...")
raw_df = generate_mock_air_quality_data(num_stations=5)
print(f"✓ Generated {len(raw_df)} raw records\n")

print("Raw data sample:")
print(raw_df.head(10))
print("\n" + "="*80 + "\n")

# Clean and pivot
print("🔄 Cleaning and pivoting data...")
cleaned_df = clean_and_pivot_aqdata(raw_df)
print(f"✓ Cleaned into {len(cleaned_df)} stations\n")

print("Cleaned data:")
print(cleaned_df)
print("\n" + "="*80 + "\n")

# Convert to JSON
data_json = cleaned_df.to_dict(orient="records")
print("✓ JSON format (sample):")
print(json.dumps(data_json[0], indent=2))