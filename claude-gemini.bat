@echo off
REM ===================================
REM Claude Code with Gemini 3 Pro
REM Run: claude-gemini.bat [task]
REM ===================================

REM Check proxy health
curl -s -o nul -w "%%{http_code}" http://localhost:8080/health 2>nul | findstr "200" > nul
if errorlevel 1 (
    echo.
    echo [ERROR] Proxy not running at localhost:8080
    echo         Start: powershell .\scripts\proxy-manager.ps1 -Action start
    echo.
    exit /b 1
)

set ANTHROPIC_BASE_URL=http://localhost:8080
set ANTHROPIC_API_KEY=dummy
set ANTHROPIC_MODEL=gemini-3-pro-high[1m]

echo.
echo ====================================
echo  Claude Code - Gemini 3 Pro Mode
echo ====================================
echo  Proxy: %ANTHROPIC_BASE_URL%
echo  Model: %ANTHROPIC_MODEL%
echo ====================================
echo.

REM Run claude with all passed arguments
claude --dangerously-skip-permissions %*
