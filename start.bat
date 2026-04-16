@echo off
setlocal enabledelayedexpansion

REM ===================================================================
REM   Devise-CAD Startup Script
REM   Launches: Frontend (React), MCP Gateway (Fastify), Desktop Agent (Python)
REM ===================================================================

title Devise-CAD Development Environment

echo.
echo ========================================
echo   Devise-CAD Development Server
echo ========================================
echo.
echo Starting services:
echo   - Frontend      (React Vite)      -> http://localhost:5173
echo   - MCP Gateway   (Fastify)         -> http://localhost:3001
echo   - Desktop Agent (Python Monitor)
echo.

REM Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm not found. Please install Node.js 18+
    pause
    exit /b 1
)

REM Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

REM Check for concurrently package
if not exist "node_modules\.bin\concurrently.cmd" (
    echo [INFO] Installing concurrently...
    call npm install -g concurrently
)

echo Starting services...
echo.

REM Start all services concurrently
npx concurrently ^
  -k ^
  -p "[{name}]" ^
  -n "FRONTEND,MCP-GATEWAY,AGENT" ^
  -c "cyan,magenta,yellow" ^
  "cd frontend && npm run dev" ^
  "cd mcp-gateway && npx tsx server.ts" ^
  "cd devise-agent\devise-eye && python main.py"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start services. Check the output above for details.
    pause
    exit /b 1
)

endlocal
