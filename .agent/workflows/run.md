---
description: Tự động chạy Claude Code CLI với proxy và thực hiện task
---

# Auto-Run Claude Code CLI

Workflow này tự động khởi động proxy và chạy Claude Code CLI để thực thi các task.

## Bước thực hiện

// turbo-all

1. Kiểm tra proxy có đang chạy không:
```powershell
$health = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method GET -ErrorAction SilentlyContinue
if ($health.status -ne "ok") {
    Write-Host "Proxy not running, starting..."
    Start-Process wscript -ArgumentList '"d:\COM ANH DUONG\CAD\scripts\start-proxy-hidden.vbs"' -WindowStyle Hidden
    Start-Sleep 5
}
```

2. Khởi động Claude Code CLI với proxy:
```powershell
$env:ANTHROPIC_BASE_URL = "http://localhost:8080"
$env:ANTHROPIC_API_KEY = "dummy"
$env:ANTHROPIC_MODEL = "gemini-3-pro-high[1m]"
claude
```

3. Sau khi Claude Code khởi động, gõ task cần thực hiện trực tiếp vào CLI.

## Lưu ý
- Proxy sử dụng **Round-Robin strategy** để phân bổ quota đều giữa các accounts
- Tất cả lệnh trong workflow này sẽ tự động chạy (turbo-all)
- Để dừng proxy: `taskkill /F /IM node.exe`
