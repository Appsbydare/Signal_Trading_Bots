@echo off
title Signal Trading Bots - Local Dev Server
color 0A

echo ============================================
echo   Signal Trading Bots - Internal Test Server
echo ============================================
echo.

REM --- Check Node.js ---
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js version: %NODE_VER%

REM --- Navigate to project directory ---
cd /d "%~dp0"
echo [OK] Working directory: %cd%
echo.

REM --- Check if node_modules exists ---
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Running npm install...
    echo        This may take a few minutes on first run.
    echo.
    npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo.
        echo [ERROR] npm install failed. Check the errors above.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully.
    echo.
) else (
    echo [OK] Dependencies already installed.
)

echo.
echo ============================================
echo.
echo   Starting Next.js Dev Server...
echo.
echo   ----------------------------------------
echo.
echo     LOCAL SERVER:  http://localhost:3000
echo.
echo   ----------------------------------------
echo.
echo   Press Ctrl+C to stop the server
echo.
echo ============================================
echo.

REM --- Open browser automatically after a short delay ---
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

call npm run dev

echo.
echo ============================================
echo   Server has been stopped.
echo ============================================
echo.
pause
