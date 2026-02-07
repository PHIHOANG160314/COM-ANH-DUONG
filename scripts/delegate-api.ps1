# scripts/delegate-api.ps1
# =====================================================
# Delegate task via Direct API call to Antigravity Proxy
# Bypasses Claude CLI, calls Gemini 3 Pro directly
# Usage: .\scripts\delegate-api.ps1 -Task "your task here"
# =====================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Task,
    [int]$MaxTokens = 4096
)

# Configuration
$PROXY_URL = "http://localhost:8080"
$MODEL = "gemini-3-pro-high"

# Check proxy health first
try {
    $health = Invoke-RestMethod -Uri "$PROXY_URL/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Proxy: $($health.available)/$($health.total) accounts" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Proxy not responding at $PROXY_URL" -ForegroundColor Red
    exit 1
}

Write-Host "[TASK] $Task" -ForegroundColor Cyan
Write-Host ""

# Build request body (Anthropic Messages API format)
$body = @{
    model = $MODEL
    max_tokens = $MaxTokens
    messages = @(
        @{
            role = "user"
            content = $Task
        }
    )
} | ConvertTo-Json -Depth 10

# Call API
try {
    $response = Invoke-RestMethod -Uri "$PROXY_URL/v1/messages" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "x-api-key" = "dummy"
            "anthropic-version" = "2023-06-01"
        } `
        -Body $body `
        -TimeoutSec 300 `
        -ErrorAction Stop

    # Extract text from response
    $text = $response.content | Where-Object { $_.type -eq "text" } | ForEach-Object { $_.text }
    
    Write-Host "========================================" -ForegroundColor DarkGray
    Write-Host $text
    Write-Host "========================================" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "[DONE] Tokens: $($response.usage.input_tokens) in / $($response.usage.output_tokens) out" -ForegroundColor Gray
    
    # Return text for pipeline usage
    return $text
    
} catch {
    Write-Host "[ERROR] API call failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
