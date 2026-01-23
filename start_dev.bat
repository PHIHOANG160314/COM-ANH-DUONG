@echo off
title F&B Master - Auto Dev Environment
color 0A

echo ===================================================
echo   F&B MASTER - AUTOMATION STARTUP
echo ===================================================
echo.
echo [1/3] Checking environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit
)

echo [2/3] Starting Local Server...
echo       (Using 'serve' or equivalent simple http server)
start "F&B Master Server" cmd /c "npx serve . -p 3000"

echo [3/3] Launching Browser...
timeout /t 2 >nul
start http://localhost:3000/customer
start http://localhost:3000/admin

echo.
echo [SUCCESS] Environment is running!
echo           Customer App: http://localhost:3000/customer
echo           Admin Dashboard: http://localhost:3000/admin
echo.
echo Press any key to close this launcher (server will stay open)...
pause >nul
