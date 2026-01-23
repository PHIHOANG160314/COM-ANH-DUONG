# Claude Code with Gemini 3 Pro
# Run this script: .\claude-gemini.ps1

# =====================================================
# Ensure proxy is running (Always-On integration)
# =====================================================
$proxyManager = Join-Path $PSScriptRoot "scripts\proxy-manager.ps1"
if (Test-Path $proxyManager) {
    & $proxyManager -Action ensure
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[WARNING] Proxy may not be running correctly!" -ForegroundColor Yellow
        Write-Host "          Some features may not work." -ForegroundColor Gray
        Write-Host ""
    }
} else {
    # Fallback: simple health check
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Host ""
        Write-Host "[WARNING] Proxy not responding at localhost:8080" -ForegroundColor Yellow
        Write-Host "          Start proxy: antigravity-claude-proxy" -ForegroundColor Gray
        Write-Host ""
    }
}
# =====================================================

$env:ANTHROPIC_BASE_URL = "http://localhost:8080"
$env:ANTHROPIC_API_KEY = "dummy"
$env:ANTHROPIC_MODEL = "gemini-3-pro-high"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host " Claude Code - Gemini 3 Pro Mode" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host " BASE_URL: $env:ANTHROPIC_BASE_URL" -ForegroundColor Yellow
Write-Host " MODEL: $env:ANTHROPIC_MODEL" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

claude $args
