# Hướng Dẫn Chạy Claude Code CLI (Qua Proxy)

Em đã tạo script tự động để anh chạy Claude CLI dễ dàng.

## Cách chạy (Khuyên dùng)
Mở terminal VS Code (PowerShell) và chạy lệnh:

```powershell
.\scripts\start-claude.ps1
```

Script này sẽ:
1. Set môi trường trỏ về Proxy (localhost:8080)
2. Set Model là `gemini-3-pro-high[1m]`
3. Tự động mở Claude CLI

## Sau khi Claude mở lên:
Anh copy và paste lệnh sau để thực hiện việc sửa Database:

```
Read .claude-task.md and execute ALL tasks
```

## Cách chạy thủ công (nếu cần)
```powershell
$env:ANTHROPIC_BASE_URL="http://localhost:8080"; $env:ANTHROPIC_API_KEY="dummy"; $env:ANTHROPIC_MODEL="gemini-3-pro-high[1m]"; claude --dangerously-skip-permissions
```
