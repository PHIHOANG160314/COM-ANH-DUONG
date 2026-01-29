# =============================================
# Antigravity Proxy Auto-Start Script
# =============================================
# Tự động khởi động proxy tại http://localhost:8080
# Thêm vào PowerShell Profile để chạy khi mở terminal

function Start-AntigravityProxy {
    param(
        [int]$Port = 8080,
        [switch]$Silent
    )
    
    # Check if proxy is already running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            if (-not $Silent) {
                Write-Host "[OK] " -ForegroundColor Green -NoNewline
                Write-Host "Proxy already running at http://localhost:$Port"
            }
            return $true
        }
    } catch {
        # Proxy not running, start it
    }
    
    if (-not $Silent) {
        Write-Host "[INFO] " -ForegroundColor Yellow -NoNewline
        Write-Host "Starting Antigravity Proxy..."
    }
    
    # Start proxy in background
    $proxyPath = (Get-Command antigravity-claude-proxy -ErrorAction SilentlyContinue).Source
    if (-not $proxyPath) {
        Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
        Write-Host "antigravity-claude-proxy not found. Run: npm install -g antigravity-claude-proxy"
        return $false
    }
    
    # Start as background job
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "title Antigravity Proxy && antigravity-claude-proxy start" -WindowStyle Minimized
    
    # Wait for startup
    Start-Sleep -Seconds 2
    
    # Verify
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            if (-not $Silent) {
                Write-Host "[SUCCESS] " -ForegroundColor Green -NoNewline
                Write-Host "Proxy started at http://localhost:$Port"
            }
            return $true
        }
    } catch {
        Write-Host "[WARNING] " -ForegroundColor Yellow -NoNewline
        Write-Host "Proxy starting... Check manually if needed."
        return $false
    }
}

# Export function
Export-ModuleMember -Function Start-AntigravityProxy
