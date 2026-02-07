---
description: Giao việc cho Claude Code CLI qua Antigravity Proxy
---

# Giao Việc Cho Claude Code CLI

## Cách Sử Dụng

### 1. Chạy Interactive Mode
```powershell
.\claude-gemini.ps1
```

### 2. Chạy Task Cụ Thể
```powershell
.\claude-gemini.ps1 -Task "Read .claude-task.md and execute all tasks"
```

### 3. Batch File (CMD)
```cmd
claude-gemini.bat
```

## Cấu Hình Hiện Tại
- **Proxy URL**: `http://localhost:8080`
- **Model**: `gemini-3-pro-high[1m]` (1 million token context)
- **Auto-approve**: `--dangerously-skip-permissions`

## Lưu Ý
- Đảm bảo proxy đang chạy: `.\scripts\proxy-manager.ps1 -Action status`
- Khởi động proxy: `.\scripts\proxy-manager.ps1 -Action start`
- Xem logs: `.\scripts\proxy-manager.ps1 -Action logs`

## Danh Sách Scripts
| Script | Chức năng |
|--------|-----------|
| `claude-gemini.ps1` | Claude CLI launcher (PowerShell) |
| `claude-gemini.bat` | Claude CLI launcher (Batch) |
| `scripts/proxy-manager.ps1` | Quản lý proxy (start/stop/status) |
| `scripts/start-proxy.ps1` | Khởi động nhanh proxy |
