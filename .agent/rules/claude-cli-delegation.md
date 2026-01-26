# Claude CLI Delegation Rule

## Quy tắc bắt buộc

Khi user yêu cầu triển khai code hoặc delegate task cho Claude Code CLI:

1. **KHÔNG tự động chạy command** - Luôn đặt `SafeToAutoRun: false`
2. **Mở terminal mới** trong VS Code workspace
3. **Gửi lệnh kèm Enter** để user confirm và thực thi
4. **Antigravity (em) quản lý và theo dõi** quá trình thực hiện

## Command Template

```powershell
$env:ANTHROPIC_BASE_URL = "http://localhost:8080"; $env:ANTHROPIC_API_KEY = "sk-ant-placeholder"; claude -p "<task_prompt>"
```

## Workflow

1. Tạo implementation_plan.md với chi tiết thay đổi
2. Chạy Claude CLI với prompt từ plan
3. Theo dõi output và báo cáo kết quả cho user
