@echo off
cd /d %~dp0

echo ============================================
echo EcoNova Sentinel - Frontend Setup
echo ============================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo [1/2] Installing Node.js dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies. Make sure Node.js is installed.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Node modules already installed, skipping...
)

echo [2/2] Starting development server...
echo.
echo ============================================
echo Starting Frontend Server...
echo ============================================
echo Server will run at: http://localhost:8080
echo.

REM Start the frontend
npm run dev
