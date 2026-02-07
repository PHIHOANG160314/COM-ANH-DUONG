# Claude Code with Gemini 3 Pro (via Antigravity Proxy)
# =====================================================
# Usage: .\claude-gemini.ps1 [-Task "your task here"]
# 
# Examples:
#   .\claude-gemini.ps1                        # Interactive mode
#   .\claude-gemini.ps1 -Task "Read README"   # Execute task
# =====================================================

param(
    [string]$Task = ""
)

# Fix encoding for special characters
[Console]::OutputEncoding = [Console]::InputEncoding = [System.Text.UTF8Encoding]::new()

# Configuration
$PROXY_URL = "http://localhost:8080"
$MODEL = "gemini-3-pro-high[1m]"  # 1M token context

# Check proxy health
try {
    $health = Invoke-RestMethod -Uri "$PROXY_URL/health" -TimeoutSec 3 -ErrorAction Stop
    $available = $health.available
    $total = $health.total
} catch {
    Write-Host ""
    Write-Host "❌ Proxy not responding at $PROXY_URL" -ForegroundColor Red
    Write-Host "   Start proxy: .\scripts\proxy-manager.ps1 -Action start" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Set environment variables
$env:ANTHROPIC_BASE_URL = $PROXY_URL
$env:ANTHROPIC_API_KEY = "dummy"
$env:ANTHROPIC_MODEL = $MODEL

# Display banner
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Claude Code - Gemini 3 Pro Mode" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Proxy:  $PROXY_URL ($available/$total available)" -ForegroundColor Gray
Write-Host " Model:  $MODEL" -ForegroundColor Gray
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if claude command exists
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: 'claude' command not found." -ForegroundColor Red
    Write-Host "   Install: npm install -g @anthropic-ai/claude-code" -ForegroundColor Yellow
    exit 1
}

# Run Claude
if ($Task -ne "") {
    Write-Host "📋 Task: $Task" -ForegroundColor Cyan
    Write-Host ""
    claude --dangerously-skip-permissions -p $Task
} else {
    Write-Host "💬 Interactive mode" -ForegroundColor Yellow
    Write-Host ""
    claude --dangerously-skip-permissions
}
