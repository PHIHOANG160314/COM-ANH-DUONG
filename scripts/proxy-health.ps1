# Proxy Health Check Script
# Returns: 0 = healthy, 1 = unhealthy
# Usage: .\proxy-health.ps1 [-ProxyUrl "http://localhost:8080"] [-Timeout 5]

param(
    [string]$ProxyUrl = "http://localhost:8080",
    [int]$Timeout = 5
)

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Antigravity Proxy Health Check" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " URL: $ProxyUrl" -ForegroundColor Gray
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$ProxyUrl/health" -TimeoutSec $Timeout -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        try {
            $data = $response.Content | ConvertFrom-Json
            
            Write-Host " Status:   OK" -ForegroundColor Green
            
            if ($data.status) {
                Write-Host " Response: $($data.status)" -ForegroundColor White
            }
            if ($data.version) {
                Write-Host " Version:  $($data.version)" -ForegroundColor White
            }
            if ($data.uptime) {
                $uptimeMinutes = [math]::Round($data.uptime / 60, 1)
                Write-Host " Uptime:   $uptimeMinutes minutes" -ForegroundColor White
            }
            if ($data.accounts) {
                Write-Host " Accounts: $($data.accounts) configured" -ForegroundColor White
            }
        } catch {
            Write-Host " Status:   OK (raw response)" -ForegroundColor Green
            Write-Host " Response: $($response.Content)" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host " [HEALTHY]" -ForegroundColor Green -BackgroundColor DarkGreen
        Write-Host ""
        exit 0
    } else {
        Write-Host " Status:   WARN" -ForegroundColor Yellow
        Write-Host " HTTP:     $($response.StatusCode)" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host " Status:   FAILED" -ForegroundColor Red
    Write-Host " Error:    $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host " [UNHEALTHY]" -ForegroundColor White -BackgroundColor DarkRed
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  - Proxy is not running" -ForegroundColor Gray
    Write-Host "  - Port 8080 is blocked" -ForegroundColor Gray
    Write-Host "  - Network issue" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To start proxy:" -ForegroundColor Yellow
    Write-Host "  .\scripts\proxy-manager.ps1 -Action start" -ForegroundColor White
    Write-Host ""
    exit 1
}
