# 🌍 EcoNova Sentinel - Setup Guide for Friends

This guide will help you set up and run the Environmental Risk Predictor application on your computer.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download Node.js](https://nodejs.org/)
3. **Git** - [Download Git](https://git-scm.com/)

---

## 🚀 Quick Setup (Recommended)

We've made it easy to get started! Just follow these steps:

### Option A: Windows Users - Automated Setup

1. **Open Command Prompt** in the project folder:
   ```cmd
   cd backend
   run_backend.bat
   ```

2. **Open a new terminal** for the frontend:
   ```cmd
   cd frontend\src
   npm install
   npm run dev
   ```

### Option B: Manual Setup

---

## 🖥️ Backend Setup

### Step 1: Create a Virtual Environment

Open Command Prompt or PowerShell in the `backend` folder:

```cmd
cd backend
python -m venv venv
```

### Step 2: Activate the Virtual Environment

```cmd
# Windows (Command Prompt)
venv\Scripts\activate.bat

# Windows (PowerShell)
venv\Scripts\Activate.ps1
```

### Step 3: Install Python Dependencies

```cmd
pip install -r requirements.txt
```

### Step 4: Start the Backend Server

```cmd
python main.py
```

The backend will run at **http://localhost:8000**

You can test it's working by visiting:
- http://localhost:8000/ - Health check
- http://localhost:8000/docs - API documentation (Swagger UI)

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory

```cmd
cd frontend\src
```

### Step 2: Install Node.js Dependencies

```cmd
npm install
```

### Step 3: Start the Frontend Development Server

```cmd
npm run dev
```

The frontend will run at **http://localhost:8080**

---

## ✅ Verification

### Backend Verification

After starting the backend, you should see:
```
✓ Returning cached data for Maharashtra (age: 0.0s)
```

Visit these URLs to verify:
- http://localhost:8000/ - Shows "EcoNova Sentinel Backend is Live"
- http://localhost:8000/mock-data - Returns mock air quality data

### Frontend Verification

After starting the frontend, you should see:
```
VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:8080/
```

Visit http://localhost:8080 to see the application!

---

## 🔧 Troubleshooting

### Backend Issues

**Port 8000 is already in use:**
```cmd
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Module not found errors:**
```cmd
# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

**Port 8080 is already in use:**
- The vite.config.ts is configured for port 8080
- You can change it in `frontend/src/vite.config.ts`

**Node modules issues:**
```cmd
# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

### Common Python Issues

**"Python is not recognized" error:**
- Add Python to your system PATH, or use the full path to Python

**Unicode errors on Windows:**
```cmd
# Set UTF-8 encoding
set PYTHONIOENCODING=utf-8
```

---

## 📱 Using the Application

### Accessing the App

1. Open your browser to **http://localhost:8080**
2. The app will automatically use mock data if the backend isn't available
3. For full functionality, ensure both backend and frontend are running

### Features Available

- 📊 **Dashboard** - Real-time AQI data for Indian cities
- 🔮 **Predictions** - 6-hour AQI forecasting
- 🏥 **Health Advisory** - Personalized health recommendations
- 🚨 **Alert Center** - Municipal alerts for high pollution
- 🌱 **Eco Credits** - Track your environmental contributions
- 📈 **Historical Trends** - View past AQI data

---

## 🔐 Environment Variables

The backend uses a public CPCB API for air quality data. A demo API key is already configured in `.env`:

```
CPCB_API_KEY=579b464db66ec23bdd0000014c77f4925514441a6df66eca0a8b1cfe
```

This key is for demo purposes. For production use, you can get your own key from the [CPCB API Portal](https://app.cpcbccr.com/).

---

## 📞 Need Help?

If you encounter any issues:

1. Check the console/terminal for error messages
2. Ensure all ports (8000, 8080) are available
3. Verify Python and Node.js are properly installed
4. Try restarting both servers

---

## 🐳 Docker Alternative (Optional)

If you prefer using Docker:

```bash
# Build and run with Docker Compose
docker-compose up -d
```

---

**Enjoy using EcoNova Sentinel! 🌍✨**
