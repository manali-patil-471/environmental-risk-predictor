@echo off
cd /d %~dp0

echo ============================================
echo EcoNova Sentinel - Backend Setup
echo ============================================

REM Check if virtual environment exists
if not exist "venv" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment. Make sure Python is installed.
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo [2/3] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo [3/3] Installing dependencies...
pip install -r requirements.txt >nul 2>&1

echo.
echo ============================================
echo Starting Backend Server...
echo ============================================
echo Server will run at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

REM Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
