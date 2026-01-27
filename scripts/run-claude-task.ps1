param(
    [string]$Task = "Check project status"
)

# Configuration
$ProxyUrl = "http://localhost:8080"

# 1. Check Proxy Health
try {
    $health = Invoke-RestMethod -Uri "$ProxyUrl/health" -Method GET -ErrorAction Stop
    if ($health.status -ne "ok") {
        Write-Error "Proxy is not healthy. Status: $($health.status)"
        exit 1
    }
    Write-Host "✅ Proxy connected: $($health.available)/$($health.total) accounts available." -ForegroundColor Green
} catch {
    Write-Warning "⚠️ Proxy not responding at $ProxyUrl. Attempting to start..."
    Start-Process wscript -ArgumentList '"d:\COM ANH DUONG\CAD\scripts\start-proxy-hidden.vbs"' -WindowStyle Hidden
    Start-Sleep -Seconds 5
}

# 2. Set Environment Variables for Claude Code
$env:ANTHROPIC_BASE_URL = $ProxyUrl
$env:ANTHROPIC_API_KEY = "dummy" # Proxy handles auth
$env:ANTHROPIC_MODEL = "gemini-2.0-flash-thinking-exp-1219" # Or gemini-exp-1206
$env:CLAUDE_NO_EVAL = "1" # Optional: disable eval prompts

Write-Host "🚀 Delegating task to Claude Code: $Task" -ForegroundColor Cyan
Write-Host "----------------------------------------"

# 3. Run Claude Code (Interactive shell but with initial prompt)
# Note: 'claude' command must be in PATH (npm install -g @anthropic-ai/claude-code)
claude "$Task"
