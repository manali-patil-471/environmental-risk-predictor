#!/usr/bin/env python3
"""
Quick test script for EcoNova Sentinel Backend
Tests all major endpoints to ensure they're working
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None, params=None):
    """Test a single endpoint"""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", params=params)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data, params=params)
        
        print(f"✅ {method} {endpoint} - {response.status_code}")
        if response.status_code == 200:
            return True, response.json()
        else:
            print(f"   Error: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {e}")
        return False, None

def run_all_tests():
    """Run all endpoint tests"""
    print("🧪 Testing EcoNova Sentinel Backend\n")
    
    results = []
    
    # 1. Health check
    success, data = test_endpoint("/")
    results.append(("Health Check", success))
    
    # 2. Live data
    success, data = test_endpoint("/live-data")
    results.append(("Live Data", success))
    if success:
        print(f"   📊 Found {data.get('count', 0)} stations")
    
    # 3. Predictions
    success, data = test_endpoint("/predict")
    results.append(("Predictions", success))
    if success:
        print(f"   🔮 Predictions for {data.get('count', 0)} stations")
    
    # 4. Personalized Health Advice
    user_data = {
        "user_id": "test_user",
        "name": "Test User",
        "email": "test@example.com",
        "age": 25,
        "age_group": "adult",
        "health_conditions": ["healthy"],
        "location_lat": 19.07,
        "location_lon": 72.87,
        "city": "Mumbai",
        "state": "Maharashtra"
    }
    success, data = test_endpoint("/health-advice", "POST", user_data)
    results.append(("Health Advice", success))
    if success:
        print(f"   👨‍⚕️ Health advice generated for {data.get('user_id')}")
    
    # 5. Municipal Alerts
    success, data = test_endpoint("/municipal-alerts", "POST", params={"state": "Maharashtra"})
    results.append(("Municipal Alerts", success))
    if success:
        print(f"   🚨 Generated {data.get('total_alerts', 0)} alerts")
    
    # 6. Eco Credits - Submit Action
    eco_data = {
        "user_id": "test_user",
        "action_type": "tree_planting",
        "description": "Planted a neem tree in my locality",
        "location_lat": 19.07,
        "location_lon": 72.87
    }
    success, data = test_endpoint("/eco-credits/submit", "POST", eco_data)
    results.append(("Eco Credits Submit", success))
    if success:
        print(f"   🌱 Earned {data.get('eco_credit', {}).get('credits_earned', 0)} credits")
    
    # 7. Eco Credits - Get User Credits
    success, data = test_endpoint("/eco-credits/test_user")
    results.append(("Get User Credits", success))
    if success:
        print(f"   💰 Total credits: {data.get('total_credits', 0)}")
    
    # 8. Eco Credits - Leaderboard
    success, data = test_endpoint("/eco-credits/leaderboard")
    results.append(("Eco Credits Leaderboard", success))
    if success:
        print(f"   🏆 Top {len(data.get('leaderboard', []))} contributors")
    
    # 9. Eco Credits - Available Actions
    success, data = test_endpoint("/eco-credits/actions")
    results.append(("Available Eco Actions", success))
    if success:
        print(f"   📋 {len(data.get('actions', []))} eco actions available")
    
    # 10. Notifications
    notification_data = [{
        "user_id": "test_user",
        "name": "Test User",
        "age": 25,
        "health_conditions": ["healthy"],
        "location_lat": 19.07,
        "location_lon": 72.87,
        "city": "Mumbai"
    }]
    success, data = test_endpoint("/notifications/generate", "POST", notification_data)
    results.append(("Generate Notifications", success))
    if success:
        print(f"   📢 Generated {data.get('total_notifications', 0)} notifications")
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST RESULTS SUMMARY")
    print("="*50)
    
    passed = 0
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if success:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 ALL TESTS PASSED! Backend is fully functional!")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
    
    return passed == len(results)

if __name__ == "__main__":
    # Wait a moment for server to start
    time.sleep(2)
    run_all_tests()
