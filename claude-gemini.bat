@echo off
REM ===================================
REM Claude Code with Gemini 3 Pro
REM ===================================

REM Check if proxy is running
curl -s -o nul -w "%%{http_code}" http://localhost:8080/health 2>nul | findstr "200" > nul
if errorlevel 1 (
    echo.
    echo [WARNING] Proxy not running at localhost:8080
    echo           Attempting to start via PM2...
    echo.
    
    REM Try PM2 start
    pm2 start "%~dp0pm2.config.js" 2>nul
    if errorlevel 1 (
        echo [INFO] PM2 not available. Start proxy manually:
        echo        antigravity-claude-proxy
        echo.
    ) else (
        pm2 save 2>nul
        timeout /t 3 /nobreak > nul
        echo [OK] Proxy started via PM2
        echo.
    )
)

set ANTHROPIC_BASE_URL=http://localhost:8080
set ANTHROPIC_API_KEY=dummy
set ANTHROPIC_MODEL=gemini-3-pro-high

echo.
echo ===================================
echo  Claude Code - Gemini 3 Pro Mode
echo ===================================
echo  BASE_URL: %ANTHROPIC_BASE_URL%
echo  MODEL: %ANTHROPIC_MODEL%
echo ===================================
echo.

claude %*
