---
description: Delegate tasks to Claude Code CLI via terminal
---

# Claude Code CLI Delegation Rule

## Mục đích
Khi cần delegate task cho Claude Code CLI thực hiện tự động, Antigravity sẽ:
1. Mở terminal mới trong VS Code
2. Chạy lệnh `claude` với task description
3. Gởi Enter để Claude Code tự thực hiện
4. KHÔNG tự thực hiện task - để Claude Code CLI handle

## Quy trình

### 1. Khởi động Claude Code CLI
```powershell
# Set environment variables
$env:ANTHROPIC_BASE_URL = "http://localhost:8080"
$env:ANTHROPIC_API_KEY = "sk-ant-xxx"

# Run Claude CLI with task
claude "[Task description here]"
```

### 2. Gởi task với Enter
Sau khi gõ lệnh claude + task, gởi newline character để Claude Code tự động bắt đầu.

### 3. Không tự thực hiện
**QUAN TRỌNG**: Antigravity KHÔNG được tự thực hiện các thay đổi code.
Chỉ delegate sang Claude Code CLI và để nó tự kiểm soát.

## Ví dụ sử dụng

Khi user nói: "Delegate task X cho Claude Code"

Antigravity sẽ:
```powershell
claude "Task X: [mô tả chi tiết task]"
# Gởi Enter
```

Rồi monitor output, KHÔNG can thiệp trực tiếp vào code.

## Lưu ý
- Đảm bảo proxy đang chạy ở localhost:8080
- Claude Code CLI phải được cài đặt: `npm i -g @anthropic-ai/claude-code`
- Task description phải đầy đủ context để Claude Code tự làm được
