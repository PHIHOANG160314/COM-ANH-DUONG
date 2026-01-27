---
description: Tự động chạy Claude Code CLI với proxy và thực hiện task
---

# 🚀 Workflow: Run Claude Code CLI

Quy trình chuẩn để giao việc cho Claude Code CLI (với Proxy) và tự động xác nhận.

## Các bước thực hiện

### 1. Khởi động Task
// turbo
Chạy lệnh PowerShell để gọi script wrapper. Thay thế `[TASK_DESCRIPTION]` bằng mô tả công việc cụ thể.

```powershell
$Task = "[TASK_DESCRIPTION]"
& "d:\COM ANH DUONG\CAD\scripts\run-claude-task.ps1" -Task $Task
```

### 2. Gửi lệnh Enter (Auto-Confirm)
// turbo
Ngay sau khi lệnh trên chạy và trả về `CommandId`, sử dụng tool `send_command_input` để gửi phím Enter.

**Tham số:**
- `CommandId`: (ID từ bước 1)
- `Input`: `"\n"`
- `WaitMs`: 5000

### 3. Giám sát & Tương tác
- Sử dụng `read_terminal` hoặc `command_status` để theo dõi output.
- Nếu Claude Code hỏi thêm (Yes/No), sử dụng `send_command_input` để phản hồi.

## Ví dụ sử dụng
- `/run dọn rác project`
- `/run migrate shipper.html to m3`
