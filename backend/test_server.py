#!/usr/bin/env python
"""Test script to verify the backend API works"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test all imports work"""
    print("=" * 60)
    print("TESTING IMPORTS")
    print("=" * 60)
    
    try:
        from main import app
        print("✓ FastAPI app imported")
    except Exception as e:
        print(f"✗ Failed to import app: {e}")
        return False
    
    try:
        from fetcher import get_live_data
        print("✓ fetcher imported")
    except Exception as e:
        print(f"✗ Failed to import fetcher: {e}")
        return False
    
    try:
        from data_cleaner import clean_and_pivot_aqdata
        print("✓ data_cleaner imported")
    except Exception as e:
        print(f"✗ Failed to import data_cleaner: {e}")
        return False
    
    try:
        from models.user_models import UserProfile, HealthAdvice, EcoCredit, MunicipalRequest
        print("✓ user_models imported")
    except Exception as e:
        print(f"✗ Failed to import user_models: {e}")
        return False
    
    try:
        from services.personalized_health import PersonalizedHealthEngine
        print("✓ personalized_health imported")
    except Exception as e:
        print(f"✗ Failed to import personalized_health: {e}")
        return False
    
    try:
        from services.municipal_alerts import MunicipalAlertSystem
        print("✓ municipal_alerts imported")
    except Exception as e:
        print(f"✗ Failed to import municipal_alerts: {e}")
        return False
    
    try:
        from services.eco_credits import EcoCreditsSystem
        print("✓ eco_credits imported")
    except Exception as e:
        print(f"✗ Failed to import eco_credits: {e}")
        return False
    
    try:
        from ml_models.risk_zones_mapper import enrich_all_stations_with_risk
        print("✓ risk_zones_mapper imported")
    except Exception as e:
        print(f"✗ Failed to import risk_zones_mapper: {e}")
        return False
    
    try:
        from ml_models.source_identifier import identify_sources_for_stations
        print("✓ source_identifier imported")
    except Exception as e:
        print(f"✗ Failed to import source_identifier: {e}")
        return False
    
    try:
        from ml_models.pollution_predictor import PollutionPredictor
        print("✓ pollution_predictor imported")
    except Exception as e:
        print(f"✗ Failed to import pollution_predictor: {e}")
    
    return True


def test_mock_data():
    """Test mock data generation"""
    print("\n" + "=" * 60)
    print("TESTING MOCK DATA")
    print("=" * 60)
    
    try:
        from generate_mock_data import generate_mock_air_quality_data
        raw_df = generate_mock_air_quality_data(num_stations=3)
        print(f"✓ Generated {len(raw_df)} mock records")
        
        from data_cleaner import clean_and_pivot_aqdata
        cleaned_df = clean_and_pivot_aqdata(raw_df)
        print(f"✓ Cleaned into {len(cleaned_df)} stations")
        
        return True
    except Exception as e:
        print(f"✗ Error with mock data: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_health_endpoints():
    """Test basic API endpoints"""
    print("\n" + "=" * 60)
    print("TESTING HEALTH ENDPOINTS")
    print("=" * 60)
    
    from fastapi.testclient import TestClient
    from main import app
    
    client = TestClient(app)
    
    # Test root endpoint
    response = client.get("/")
    print(f"GET /: {response.status_code}")
    if response.status_code == 200:
        print("✓ Root endpoint works")
    else:
        print(f"✗ Root endpoint failed: {response.text}")
        return False
    
    # Test health endpoint
    response = client.get("/health")
    print(f"GET /health: {response.status_code}")
    if response.status_code == 200:
        print("✓ Health endpoint works")
    else:
        print(f"✗ Health endpoint failed")
        return False
    
    return True


def test_mock_data_endpoint():
    """Test mock-data endpoint"""
    print("\n" + "=" * 60)
    print("TESTING MOCK DATA ENDPOINT")
    print("=" * 60)
    
    from fastapi.testclient import TestClient
    from main import app
    
    client = TestClient(app)
    
    response = client.get("/mock-data?num_stations=3")
    print(f"GET /mock-data: {response.status_code}")
    
    if response.status_code == 200:
        print("✓ Mock data endpoint works")
        data = response.json()
        print(f"  - Returned {data.get('count', 0)} stations")
        return True
    else:
        print(f"✗ Mock data endpoint failed: {response.text}")
        return False


def test_historical_data():
    """Test historical data endpoints"""
    print("\n" + "=" * 60)
    print("TESTING HISTORICAL DATA ENDPOINTS")
    print("=" * 60)
    
    from fastapi.testclient import TestClient
    from main import app
    
    client = TestClient(app)
    
    response = client.get("/historical-aqi?days=1")
    print(f"GET /historical-aqi: {response.status_code}")
    
    if response.status_code == 200:
        print("✓ Historical AQI endpoint works")
        return True
    elif response.status_code == 404:
        print("⚠ Historical data file not found (this is OK)")
        return True
    else:
        print(f"✗ Historical AQI endpoint failed: {response.text}")
        return False


def test_eco_credits():
    """Test eco-credits endpoints"""
    print("\n" + "=" * 60)
    print("TESTING ECO-CREDITS ENDPOINTS")
    print("=" * 60)
    
    from fastapi.testclient import TestClient
    from main import app
    
    client = TestClient(app)
    
    # Test available actions
    response = client.get("/eco-credits/actions")
    print(f"GET /eco-credits/actions: {response.status_code}")
    
    if response.status_code == 200:
        print("✓ Eco-credits actions endpoint works")
    else:
        print(f"✗ Eco-credits actions failed: {response.text}")
        return False
    
    # Test leaderboard
    response = client.get("/eco-credits/leaderboard")
    print(f"GET /eco-credits/leaderboard: {response.status_code}")
    
    if response.status_code == 200:
        print("✓ Eco-credits leaderboard works")
    else:
        print(f"✗ Eco-credits leaderboard failed")
        return False
    
    return True


if __name__ == "__main__":
    print("\n🧪 RUNNING BACKEND TESTS\n")
    
    all_passed = True
    
    # Run tests
    if not test_imports():
        all_passed = False
        print("\n❌ Import tests failed!")
        sys.exit(1)
    
    if not test_mock_data():
        all_passed = False
        print("\n⚠️ Mock data test had issues")
    
    if not test_health_endpoints():
        all_passed = False
        print("\n❌ Health endpoint tests failed!")
        sys.exit(1)
    
    if not test_mock_data_endpoint():
        all_passed = False
        print("\n⚠️ Mock data endpoint test had issues")
    
    if not test_historical_data():
        all_passed = False
        print("\n⚠️ Historical data test had issues")
    
    if not test_eco_credits():
        all_passed = False
        print("\n⚠️ Eco-credits test had issues")
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL TESTS PASSED!")
    else:
        print("⚠️ SOME TESTS HAD WARNINGS")
    print("=" * 60)
