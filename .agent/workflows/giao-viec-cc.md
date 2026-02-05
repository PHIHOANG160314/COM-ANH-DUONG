---
description: Giao việc cho Claude Code CLI với script PowerShell tự động
---

# Workflow: Giao Việc Claude Code CLI (PowerShell Script)

Workflow này sử dụng script PowerShell `scripts/start-claude.ps1` để khởi động Claude Code CLI với cấu hình Proxy Antigravity.

// turbo-all

## 1. Kiểm tra/Tạo script khởi động

Kiểm tra file `scripts/start-claude.ps1`. Nếu chưa có, tạo file với nội dung sau:

```powershell
# scripts/start-claude.ps1
# Fix encoding for special characters
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
```

## 2. Thực thi Workflow

Để chạy workflow này, chỉ cần thực hiện lệnh sau trong terminal:

```powershell
.\scripts\start-claude.ps1
```

Sau đó gửi task cho Claude CLI (ví dụ qua file .claude-task.md):
```text
Read .claude-task.md and execute ALL tasks
```

## 3. (Tùy chọn) Chạy trực tiếp một lệnh task 

```powershell
$env:ANTHROPIC_BASE_URL="http://localhost:8080"; $env:ANTHROPIC_API_KEY="dummy"; $env:ANTHROPIC_MODEL="gemini-3-pro-high[1m]"; claude --dangerously-skip-permissions -p "Read .claude-task.md and execute ALL tasks"
```
