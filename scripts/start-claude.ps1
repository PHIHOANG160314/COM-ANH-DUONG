# Script khoi dong Claude Code CLI voi Antigravity Proxy
$OutputEncoding = [Console]::InputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding

$env:ANTHROPIC_BASE_URL = "http://localhost:8080"
$env:ANTHROPIC_API_KEY = "dummy"
$env:ANTHROPIC_MODEL = "gemini-3-pro-high[1m]"

Write-Host "Starting Claude Code CLI..." -ForegroundColor Green
Write-Host "Proxy: $env:ANTHROPIC_BASE_URL" -ForegroundColor Gray
Write-Host "Model: $env:ANTHROPIC_MODEL" -ForegroundColor Gray

if (Get-Command claude -ErrorAction SilentlyContinue) {
    claude --dangerously-skip-permissions
} else {
    Write-Host "Error: 'claude' command not found. Please install: npm install -g @anthropic-ai/claude-code" -ForegroundColor Red
}
