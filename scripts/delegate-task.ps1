# scripts/delegate-task.ps1
# =====================================================
# Delegate task to Claude CLI via Antigravity Proxy
# Usage: .\scripts\delegate-task.ps1 -Task "your task here"
# =====================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Task
)

# Fix encoding
[Console]::OutputEncoding = [Console]::InputEncoding = [System.Text.UTF8Encoding]::new()

# Configuration
$PROXY_URL = "http://localhost:8080"
$MODEL = "gemini-3-pro-high[1m]"

# Check proxy
try {
    $health = Invoke-RestMethod -Uri "$PROXY_URL/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "[OK] Proxy connected ($($health.available)/$($health.total) available)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Proxy not responding at $PROXY_URL" -ForegroundColor Red
    exit 1
}

# Set environment
$env:ANTHROPIC_BASE_URL = $PROXY_URL
$env:ANTHROPIC_API_KEY = "dummy"
$env:ANTHROPIC_MODEL = $MODEL

# Write task to file for reference
$Task | Out-File -FilePath ".claude-task.md" -Encoding UTF8 -Force

Write-Host ""
Write-Host "[TASK] Delegating to Claude CLI..." -ForegroundColor Cyan
Write-Host "       Model: $MODEL" -ForegroundColor Gray
Write-Host "       Task: $Task" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor DarkGray

# Execute Claude CLI with task
# Using -p flag for print mode (non-interactive)
$output = claude --dangerously-skip-permissions -p $Task 2>&1

Write-Host "========================================" -ForegroundColor DarkGray
Write-Host ""

# Return output
$output
