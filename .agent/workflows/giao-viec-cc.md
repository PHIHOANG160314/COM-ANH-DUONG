---
description: Giao việc cho Claude Code CLI tự động, tự accept không hỏi
---

# Workflow: Giao Việc Claude Code CLI

Workflow này tự động mở terminal, giao việc cho Claude Code CLI và tự accept.
**Sử dụng Antigravity Claude Proxy v2.4.2**

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
# Antigravity Proxy Configuration
$env:ANTHROPIC_BASE_URL = "http://localhost:8080"
$env:ANTHROPIC_API_KEY = "dummy"

# Gemini 3 Pro High [1M Context] - Recommended
$env:ANTHROPIC_MODEL = "gemini-3-pro-high[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = "gemini-3-pro-high[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = "gemini-3-flash[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = "gemini-2.5-flash-lite[1m]"
$env:CLAUDE_CODE_SUBAGENT_MODEL = "gemini-3-flash[1m]"

# Chạy Claude với dangerously-skip-permissions (auto-accept)
claude --dangerously-skip-permissions "{TASK}"
```

### 3. Gửi lệnh Enter nếu cần
Nếu Claude CLI đang chờ input, gửi Enter để tiếp tục.

## Available Models (v2.4.2)

### Gemini Models (Fast, 1M context)
| Model | Description |
|-------|-------------|
| `gemini-3-pro-high[1m]` | Pro tier, chất lượng cao, 1M context |
| `gemini-3-flash[1m]` | Nhanh, 1M context |
| `gemini-2.5-flash-lite[1m]` | Tiết kiệm, 1M context |

### Claude Models (Fallback)
| Model | Description |
|-------|-------------|
| `claude-opus-4-5-thinking` | Mạnh nhất, thinking mode |
| `claude-sonnet-4-5-thinking` | Cân bằng, thinking mode |
| `claude-sonnet-4-5` | Nhanh, không thinking |

## Lưu ý Quan Trọng
- Flag `--dangerously-skip-permissions` cho phép tự động accept mọi thay đổi
- Chỉ dùng cho tasks đã được review kỹ
- Các lệnh có `// turbo-all` sẽ tự động chạy
- Web console: http://localhost:8080 để quản lý accounts và settings
- Suffix `[1m]` kích hoạt context window 1 triệu tokens

## Ví dụ sử dụng
```
/giao-viec-cc Upgrade shipper.html sang Material Web components
/giao-viec-cc Fix bug đăng nhập shipper trên mobile
```
