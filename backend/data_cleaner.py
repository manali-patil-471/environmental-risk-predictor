import pandas as pd
import numpy as np

def clean_and_pivot_aqdata(df):
    """
    Transform raw CPCB API data where each pollutant is a separate row
    into a single row per station with all pollutant columns.
    
    Actual API columns:
    - country, state, city, station, last_update
    - latitude, longitude
    - pollutant_id: Type of pollutant (PM2.5, PM10, NO2, SO2, CO, etc.)
    - min_value, max_value, avg_value: Concentration values
    
    Returns:
    - DataFrame with columns: [station, city, latitude, longitude, PM2.5, PM10, NO2, SO2, CO, overall_aqi]
    """
    if df is None or df.empty:
        return pd.DataFrame()
    
    # Ensure required columns exist
    required_cols = ['station', 'city', 'latitude', 'longitude', 'pollutant_id', 'avg_value']
    if not all(col in df.columns for col in required_cols):
        print(f"Available columns: {list(df.columns)}")
        raise ValueError(f"DataFrame must contain columns: {required_cols}")
    
    # Create a copy to avoid modifying original
    df_clean = df.copy()
    
    # Convert numeric columns
    df_clean['latitude'] = pd.to_numeric(df_clean['latitude'], errors='coerce')
    df_clean['longitude'] = pd.to_numeric(df_clean['longitude'], errors='coerce')
    df_clean['avg_value'] = pd.to_numeric(df_clean['avg_value'], errors='coerce')
    
    # CRITICAL: Remove rows with NaN values in key columns
    df_clean = df_clean.dropna(subset=['latitude', 'longitude', 'avg_value', 'pollutant_id'])
    
    if df_clean.empty:
        print("⚠️ Warning: All rows had invalid data and were removed")
        return pd.DataFrame()
    
<<<<<<< HEAD
=======
    # Preserve state if present; otherwise fill placeholder.
    if 'state' not in df_clean.columns:
        df_clean['state'] = 'Unknown State'
    else:
        df_clean['state'] = df_clean['state'].fillna('Unknown State')

>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
    # Rename pollutant_id to pollutant for consistency
    df_clean = df_clean.rename(columns={'pollutant_id': 'pollutant', 'avg_value': 'pollutant_avg'})
    
    # Pivot the data: make each pollutant a column
    pivot_df = df_clean.pivot_table(
<<<<<<< HEAD
        index=['station', 'city', 'latitude', 'longitude'],
=======
        index=['station', 'city', 'state', 'latitude', 'longitude'],
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
        columns='pollutant',
        values='pollutant_avg',
        aggfunc='first'  # In case of duplicates, take first value
    ).reset_index()
    
    # Get all pollutant columns dynamically (instead of hardcoding)
<<<<<<< HEAD
    pollutant_cols = [col for col in pivot_df.columns if col not in ['station', 'city', 'latitude', 'longitude']]
=======
    pollutant_cols = [col for col in pivot_df.columns if col not in ['station', 'city', 'state', 'latitude', 'longitude']]
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
    
    print(f"✓ Found pollutants: {sorted(pollutant_cols)}")
    print(f"✓ Stations after pivot: {len(pivot_df)}")
    
    # Replace NaN with None for JSON serialization (or use 0)
    # Using None will show as null in JSON
    for col in pollutant_cols:
        pivot_df[col] = pivot_df[col].where(pd.notna(pivot_df[col]), None)
    
    # Calculate overall AQI as max of all pollutant values (ignoring NaN)
    # This will be the maximum pollutant concentration across all measured pollutants
    pivot_df['overall_aqi'] = pivot_df[pollutant_cols].max(axis=1, skipna=True)
    
    # Handle any remaining NaN values in overall_aqi
    pivot_df['overall_aqi'] = pivot_df['overall_aqi'].fillna(0)
    
    # Round numerical values to 2 decimal places
    numeric_cols = ['latitude', 'longitude'] + ['overall_aqi']
    for col in numeric_cols:
        if col in pivot_df.columns:
            # Only round non-null values
            pivot_df[col] = pivot_df[col].apply(
                lambda x: round(x, 2) if pd.notna(x) else None
            )
    
    # Round pollutant values
    for col in pollutant_cols:
        pivot_df[col] = pivot_df[col].apply(
            lambda x: round(x, 2) if pd.notna(x) else None
        )
    
    # Reorder columns: station, city, lat, long, then pollutants, then aqi
<<<<<<< HEAD
    final_cols = ['station', 'city', 'latitude', 'longitude'] + sorted(pollutant_cols) + ['overall_aqi']
=======
    final_cols = ['station', 'city', 'state', 'latitude', 'longitude'] + sorted(pollutant_cols) + ['overall_aqi']
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
    final_cols = [col for col in final_cols if col in pivot_df.columns]  # Only include existing columns
    
    print(f"✓ Final columns: {final_cols}")
    
    # Final check: Remove any rows that are completely invalid
    result_df = pivot_df[final_cols].copy()
    
    # Ensure all float columns are either valid numbers or None (not NaN or Inf)
    for col in result_df.select_dtypes(include=['float64']).columns:
        result_df[col] = result_df[col].apply(
            lambda x: None if (pd.isna(x) or np.isinf(x)) else x
        )
    
    print(f"✓ Ready to serialize: {len(result_df)} stations")
    return result_df


def calculate_aqi_index(pollutants_dict):
    """
    Calculate AQI (Air Quality Index) based on pollutant concentrations.
    Simplified version - use official EPA/CPCB formulas in production.
    
    Args:
        pollutants_dict: Dict with keys like 'PM2.5', 'PM10', 'NO2', 'SO2', 'CO'
    
    Returns:
        AQI value (0-500+)
    """
    # Simplified AQI calculation - these are example breakpoints
    aqi_breakpoints = {
        'PM2.5': [30, 60, 90, 120, 250],
        'PM10': [50, 100, 250, 350, 430],
        'NO2': [40, 80, 180, 280, 400],
        'SO2': [40, 80, 380, 800, 1600],
        'CO': [1, 2, 10, 17, 34],
        'OZONE': [50, 100, 168, 208, 748]
    }
    
    sub_indices = []
    for pollutant, value in pollutants_dict.items():
        if pd.isna(value) or value is None or pollutant not in aqi_breakpoints:
            continue
        
        breakpoints = aqi_breakpoints[pollutant]
        if value <= breakpoints[0]:
            sub_index = (value / breakpoints[0]) * 50
        elif value <= breakpoints[1]:
            sub_index = 50 + ((value - breakpoints[0]) / (breakpoints[1] - breakpoints[0])) * 50
        else:
            sub_index = 100 + ((value - breakpoints[1]) / (breakpoints[2] - breakpoints[1])) * 100
        
        sub_indices.append(sub_index)
    
<<<<<<< HEAD
    return max(sub_indices) if sub_indices else 0
=======
    return max(sub_indices) if sub_indices else 0
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
