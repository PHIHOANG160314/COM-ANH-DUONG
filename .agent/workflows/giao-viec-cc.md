---
description: Giao việc cho Claude Code CLI tự động, tự accept không hỏi
---

# Workflow: Giao Việc Claude Code CLI

Workflow này tự động mở terminal, giao việc cho Claude Code CLI và tự accept.

// turbo-all

## Các bước thực hiện

### 1. Kiểm tra Proxy hoạt động
```powershell
try { 
    $health = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 3
    Write-Host "✅ Proxy OK: $($health.available)/$($health.total) accounts"
} catch { 
    Write-Host "⚠️ Khởi động proxy..."
    Start-Process wscript -ArgumentList '"d:\COM ANH DUONG\CAD\scripts\start-proxy-hidden.vbs"' -WindowStyle Hidden
    Start-Sleep -Seconds 5
}
```

### 2. Set Environment và chạy Claude CLI với task
Thay `{TASK}` bằng mô tả task cần thực hiện:
```powershell
$env:ANTHROPIC_BASE_URL = "http://localhost:8080"
$env:ANTHROPIC_API_KEY = "dummy"
$env:ANTHROPIC_MODEL = "gemini-2.0-flash-thinking-exp-1219"

# Chạy Claude với dangerously-skip-permissions (auto-accept)
claude --dangerously-skip-permissions "{TASK}"
```

### 3. Gửi lệnh Enter nếu cần
Nếu Claude CLI đang chờ input, gửi Enter để tiếp tục.

## Lưu ý Quan Trọng
- Flag `--dangerously-skip-permissions` cho phép tự động accept mọi thay đổi
- Chỉ dùng cho tasks đã được review kỹ
- Các lệnh có `// turbo-all` sẽ tự động chạy

## Ví dụ sử dụng
```
/giao-viec-cc Upgrade shipper.html sang Material Web components
```
