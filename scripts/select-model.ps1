# =====================================================
# Select Model Script - Token Optimization
# =====================================================
# Tự động chọn model Antigravity dựa trên độ phức tạp của task
# Usage: . .\scripts\select-model.ps1 -Complexity <simple|medium|complex>
# =====================================================

param(
    [ValidateSet('simple', 'medium', 'complex', 'thinking')]
    [string]$Complexity = 'medium',
    [switch]$Silent
)

# Model mapping
$MODEL_MAP = @{
    'simple'   = 'gemini-3-flash[1m]'       # Nhanh, tiết kiệm token
    'medium'   = 'gemini-3-pro-high[1m]'    # Cân bằng chất lượng/tốc độ
    'complex'  = 'gemini-3-pro-high[1m]'    # Chất lượng cao nhất
    'thinking' = 'claude-sonnet-4-5-thinking' # Chain-of-thought reasoning
}

# Token estimation (approximate)
$TOKEN_ESTIMATE = @{
    'simple'   = '~2,000 tokens/request'
    'medium'   = '~5,000 tokens/request'
    'complex'  = '~10,000 tokens/request'
    'thinking' = '~15,000 tokens/request'
}

# Set environment variables
$selectedModel = $MODEL_MAP[$Complexity]
$env:ANTHROPIC_MODEL = $selectedModel
$env:ANTHROPIC_BASE_URL = "http://localhost:8080"
$env:ANTHROPIC_API_KEY = "dummy"

if (-not $Silent) {
    Write-Host ""
    Write-Host "====================================="-ForegroundColor Cyan
    Write-Host " Antigravity Model Selector" -ForegroundColor White
    Write-Host "====================================="-ForegroundColor Cyan
    Write-Host ""
    Write-Host " Complexity:     $Complexity" -ForegroundColor White
    Write-Host " Selected Model: " -NoNewline; Write-Host $selectedModel -ForegroundColor Green
    Write-Host " Token Est.:     $($TOKEN_ESTIMATE[$Complexity])" -ForegroundColor Gray
    Write-Host ""
    Write-Host " Environment Variables Set:" -ForegroundColor Yellow
    Write-Host "   ANTHROPIC_MODEL    = $env:ANTHROPIC_MODEL"
    Write-Host "   ANTHROPIC_BASE_URL = $env:ANTHROPIC_BASE_URL"
    Write-Host "   ANTHROPIC_API_KEY  = (set)"
    Write-Host ""
    Write-Host " Ready to run:" -ForegroundColor Green
    Write-Host "   claude --dangerously-skip-permissions -p 'Your task here'"
    Write-Host ""
}

# Return the model name for scripting use
return $selectedModel
