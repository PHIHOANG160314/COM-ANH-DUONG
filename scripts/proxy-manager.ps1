# =====================================================
# Proxy Manager - Start/Stop/Status/Ensure Running
# =====================================================
# Usage: .\proxy-manager.ps1 -Action <action>
# Actions: install, start, stop, restart, status, ensure, logs
# =====================================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'ensure', 'install', 'logs', 'uninstall')]
    [string]$Action
)

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_DIR = Split-Path -Parent $SCRIPT_DIR
$PM2_CONFIG = Join-Path $PROJECT_DIR "pm2.config.js"
$PROXY_NAME = "antigravity-proxy"
$PROXY_URL = "http://localhost:8080"
$PM2_HOME = "C:\pm2"

# =====================================================
# Helper Functions
# =====================================================

function Test-ProxyRunning {
    try {
        $response = Invoke-WebRequest -Uri "$PROXY_URL/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Test-PM2Installed {
    $pm2 = Get-Command pm2 -ErrorAction SilentlyContinue
    return $null -ne $pm2
}

function Get-PM2Status {
    if (-not (Test-PM2Installed)) { return $null }
    
    try {
        $pm2List = pm2 jlist 2>$null
        if ($pm2List -and $pm2List -ne "[]") {
            $processes = $pm2List | ConvertFrom-Json
            return $processes | Where-Object { $_.name -eq $PROXY_NAME }
        }
    } catch {}
    return $null
}

function Write-Banner {
    param([string]$Title)
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor White
    Write-Host "=====================================" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    
    switch ($Status) {
        "OK"      { Write-Host " [OK] " -NoNewline -ForegroundColor Green; Write-Host $Message }
        "WARN"    { Write-Host " [!]  " -NoNewline -ForegroundColor Yellow; Write-Host $Message }
        "ERROR"   { Write-Host " [X]  " -NoNewline -ForegroundColor Red; Write-Host $Message }
        "INFO"    { Write-Host " [*]  " -NoNewline -ForegroundColor Cyan; Write-Host $Message }
        "WAIT"    { Write-Host " [~]  " -NoNewline -ForegroundColor Gray; Write-Host $Message }
        default   { Write-Host "      $Message" }
    }
}

# =====================================================
# Main Actions
# =====================================================

switch ($Action) {

    # -------------------------------------------------
    'install' {
        Write-Banner "Installing PM2 Always-On Service"
        
        # Check Node.js
        $node = Get-Command node -ErrorAction SilentlyContinue
        if (-not $node) {
            Write-Step "Node.js not found! Please install Node.js first." "ERROR"
            exit 1
        }
        Write-Step "Node.js: $((node --version))" "OK"
        
        # Install PM2
        if (-not (Test-PM2Installed)) {
            Write-Step "Installing PM2 globally..." "INFO"
            npm install -g pm2
        }
        Write-Step "PM2: $((pm2 --version))" "OK"
        
        # Check pm2-windows-service
        $serviceCmd = Get-Command pm2-service-install -ErrorAction SilentlyContinue
        if (-not $serviceCmd) {
            Write-Step "Installing pm2-windows-service..." "INFO"
            npm install -g pm2-windows-service
        }
        Write-Step "pm2-windows-service installed" "OK"
        
        # Set PM2_HOME
        $currentPM2Home = [Environment]::GetEnvironmentVariable("PM2_HOME", "Machine")
        if (-not $currentPM2Home) {
            Write-Step "Setting PM2_HOME environment variable..." "INFO"
            [Environment]::SetEnvironmentVariable("PM2_HOME", $PM2_HOME, "Machine")
            $env:PM2_HOME = $PM2_HOME
        }
        Write-Step "PM2_HOME: $PM2_HOME" "OK"
        
        # Create PM2_HOME directory
        if (-not (Test-Path $PM2_HOME)) {
            New-Item -ItemType Directory -Path $PM2_HOME -Force | Out-Null
        }
        Write-Step "PM2 directory created" "OK"
        
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host " Installation Complete!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps (run as Administrator):" -ForegroundColor Yellow
        Write-Host "  1. pm2-service-install -n AntigravityProxy" -ForegroundColor White
        Write-Host "  2. .\scripts\proxy-manager.ps1 -Action start" -ForegroundColor White
        Write-Host ""
    }

    # -------------------------------------------------
    'start' {
        Write-Banner "Starting Proxy"
        
        if (-not (Test-PM2Installed)) {
            Write-Step "PM2 not installed! Run: .\proxy-manager.ps1 -Action install" "ERROR"
            exit 1
        }
        
        # Check if already running
        if (Test-ProxyRunning) {
            Write-Step "Proxy already running at $PROXY_URL" "OK"
            exit 0
        }
        
        Write-Step "Starting via PM2..." "INFO"
        Push-Location $PROJECT_DIR
        pm2 start $PM2_CONFIG
        pm2 save
        Pop-Location
        
        # Wait and verify
        Write-Step "Waiting for startup..." "WAIT"
        Start-Sleep -Seconds 3
        
        if (Test-ProxyRunning) {
            Write-Step "Proxy started successfully!" "OK"
            Write-Host ""
            pm2 list
        } else {
            Write-Step "Proxy may still be starting. Check: pm2 logs $PROXY_NAME" "WARN"
        }
    }

    # -------------------------------------------------
    'stop' {
        Write-Banner "Stopping Proxy"
        
        if (-not (Test-PM2Installed)) {
            Write-Step "PM2 not installed" "WARN"
            exit 0
        }
        
        pm2 stop $PROXY_NAME 2>$null
        pm2 save
        
        Write-Step "Proxy stopped" "OK"
    }

    # -------------------------------------------------
    'restart' {
        Write-Banner "Restarting Proxy"
        
        if (-not (Test-PM2Installed)) {
            Write-Step "PM2 not installed!" "ERROR"
            exit 1
        }
        
        Write-Step "Restarting..." "INFO"
        pm2 restart $PROXY_NAME
        pm2 save
        
        Start-Sleep -Seconds 2
        
        if (Test-ProxyRunning) {
            Write-Step "Proxy restarted!" "OK"
        } else {
            Write-Step "Checking status in 3s..." "WAIT"
            Start-Sleep -Seconds 3
            if (Test-ProxyRunning) {
                Write-Step "Proxy is now running!" "OK"
            }
        }
        
        pm2 list
    }

    # -------------------------------------------------
    'status' {
        Write-Banner "Proxy Status"
        
        # Check PM2 status
        if (Test-PM2Installed) {
            $pm2Status = Get-PM2Status
            if ($pm2Status) {
                Write-Step "PM2 Process: $($pm2Status.name)" "OK"
                Write-Step "PM2 Status:  $($pm2Status.pm2_env.status)" "INFO"
                Write-Step "Restarts:    $($pm2Status.pm2_env.restart_time)" "INFO"
                
                if ($pm2Status.pm2_env.pm_uptime) {
                    $uptimeMs = (Get-Date).ToUniversalTime().Subtract([DateTime]::new(1970,1,1,0,0,0)).TotalMilliseconds - $pm2Status.pm2_env.pm_uptime
                    $uptimeMin = [math]::Round($uptimeMs / 1000 / 60, 1)
                    Write-Step "Uptime:      $uptimeMin minutes" "INFO"
                }
            } else {
                Write-Step "Not registered in PM2" "WARN"
            }
        } else {
            Write-Step "PM2 not installed" "WARN"
        }
        
        Write-Host ""
        
        # Check HTTP health
        if (Test-ProxyRunning) {
            Write-Step "Health Check: HEALTHY" "OK"
            Write-Host ""
            
            # Get detailed health
            try {
                $response = Invoke-WebRequest -Uri "$PROXY_URL/health" -TimeoutSec 3 -UseBasicParsing
                $data = $response.Content | ConvertFrom-Json
                Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
            } catch {}
        } else {
            Write-Step "Health Check: UNHEALTHY" "ERROR"
            Write-Host ""
            Write-Host "  Proxy is not responding at $PROXY_URL" -ForegroundColor Gray
        }
        
        Write-Host ""
        
        # Show PM2 details if available
        if (Test-PM2Installed -and $pm2Status) {
            pm2 list
        }
    }

    # -------------------------------------------------
    'ensure' {
        # Silent mode for script integration
        if (Test-ProxyRunning) {
            exit 0
        }
        
        # Not running - try to start
        if (-not (Test-PM2Installed)) {
            Write-Host "[WARN] Proxy not running. PM2 not installed." -ForegroundColor Yellow
            Write-Host "       Install: .\scripts\proxy-manager.ps1 -Action install" -ForegroundColor Gray
            exit 1
        }
        
        Write-Host "[INFO] Proxy not running, starting..." -ForegroundColor Yellow
        
        # Try to restart or start
        $pm2Status = Get-PM2Status
        if ($pm2Status) {
            pm2 restart $PROXY_NAME 2>$null
        } else {
            Push-Location $PROJECT_DIR
            pm2 start $PM2_CONFIG 2>$null
            Pop-Location
        }
        pm2 save 2>$null
        
        # Wait and verify
        Start-Sleep -Seconds 3
        
        if (Test-ProxyRunning) {
            Write-Host "[OK] Proxy started!" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "[ERROR] Failed to start proxy. Check: pm2 logs $PROXY_NAME" -ForegroundColor Red
            exit 1
        }
    }

    # -------------------------------------------------
    'logs' {
        if (-not (Test-PM2Installed)) {
            Write-Host "PM2 not installed" -ForegroundColor Red
            exit 1
        }
        
        pm2 logs $PROXY_NAME --lines 50
    }

    # -------------------------------------------------
    'uninstall' {
        Write-Banner "Uninstalling PM2 Service"
        
        Write-Step "Stopping proxy..." "INFO"
        pm2 stop $PROXY_NAME 2>$null
        pm2 delete $PROXY_NAME 2>$null
        pm2 save 2>$null
        
        Write-Host ""
        Write-Host "To remove Windows service, run as Administrator:" -ForegroundColor Yellow
        Write-Host "  pm2-service-uninstall" -ForegroundColor White
        Write-Host ""
    }
}
