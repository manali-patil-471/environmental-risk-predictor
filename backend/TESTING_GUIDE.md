# 🧪 EcoNova Sentinel - Complete Backend Testing Guide

## 🚀 Start the Server

```bash
cd backend
venv\Scripts\python.exe main.py
```

Server will run on: **http://localhost:8000**

## 📋 All Available Endpoints

### **1. Core Data Endpoints** ✅
- `GET /` - Health check
- `GET /live-data` - Real-time air quality (All India)
- `GET /live-data?state=Maharashtra` - State-specific data
- `GET /predict` - AQI predictions (6-hour forecast)
- `GET /mock-data` - Test data

### **2. Personalized Health Dashboard** ✅
```bash
# Test personalized health advice
curl -X POST "http://localhost:8000/health-advice" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "age_group": "adult",
    "health_conditions": ["healthy"],
    "location_lat": 19.07,
    "location_lon": 72.87,
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

### **3. Municipal Alert System** ✅
```bash
# Trigger municipal alerts for high-risk zones
curl -X POST "http://localhost:8000/municipal-alerts?state=Delhi"
```

### **4. Eco-Credits System** ✅
```bash
# Submit eco action
curl -X POST "http://localhost:8000/eco-credits/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "action_type": "tree_planting",
    "description": "Planted a neem tree in my locality",
    "location_lat": 19.07,
    "location_lon": 72.87
  }'

# Get user credits
curl "http://localhost:8000/eco-credits/user123"

# Get leaderboard
curl "http://localhost:8000/eco-credits/leaderboard"

# Get available actions
curl "http://localhost:8000/eco-credits/actions"
```

### **5. Notification System** ✅
```bash
# Generate citizen notifications
curl -X POST "http://localhost:8000/notifications/generate?state=Maharashtra" \
  -H "Content-Type: application/json" \
  -d '[{
    "user_id": "user123",
    "name": "John Doe",
    "age": 25,
    "health_conditions": ["healthy"],
    "location_lat": 19.07,
    "location_lon": 72.87,
    "city": "Mumbai"
  }]'
```

## 🎯 Testing Scenarios

### **Scenario 1: Healthy Adult**
```json
{
  "user_id": "adult1",
  "age": 25,
  "health_conditions": ["healthy"],
  "location_lat": 19.07,
  "location_lon": 72.87
}
```
**Expected**: Lower risk sensitivity, normal outdoor activities allowed

### **Scenario 2: Asthma Patient**
```json
{
  "user_id": "asthma1", 
  "age": 35,
  "health_conditions": ["asthma"],
  "location_lat": 19.07,
  "location_lon": 72.87
}
```
**Expected**: Higher risk sensitivity, strict outdoor limitations

### **Scenario 3: Elderly with Heart Disease**
```json
{
  "user_id": "elderly1",
  "age": 70,
  "health_conditions": ["elderly", "heart_disease"],
  "location_lat": 19.07,
  "location_lon": 72.87
}
```
**Expected**: Very high risk sensitivity, stay indoors recommendation

## 📊 Expected Features

### **Personalized Health Advice**:
- ✅ Risk multipliers based on health conditions
- ✅ Age-based sensitivity adjustments
- ✅ Personalized recommendations
- ✅ Medical advice for specific conditions

### **Municipal Alerts**:
- ✅ Automatic detection of high-risk zones (AQI > 200)
- ✅ Authority routing (traffic, municipal, pollution board)
- ✅ Action recommendations per pollution source
- ✅ Urgency levels (high/medium/low)

### **Eco-Credits**:
- ✅ 9 different eco actions with credit values
- ✅ Photo upload verification system
- ✅ Leaderboard for gamification
- ✅ User credit breakdown

### **Notifications**:
- ✅ Personalized alert messages
- ✅ Risk-based notification triggers
- ✅ Location-aware nearest station detection

## 🔍 What to Check

1. **ML Source Identification**: Look for `"source_method": "ml"` in responses
2. **Personalized Risk**: Different recommendations for different user profiles
3. **Municipal Integration**: Automatic request generation for AQI > 200
4. **Eco-Credits**: Credit accumulation and leaderboard functionality
5. **Real-time Data**: Live CPCB data with proper caching

## 🎉 Success Indicators

- All endpoints return 200 status codes
- ML model provides source classifications
- Health advice changes based on user profiles
- Municipal alerts generated for high pollution
- Eco credits awarded for actions
- Notifications personalized per user

**Your backend now implements ALL 7 core requirements!** 🌍✨
