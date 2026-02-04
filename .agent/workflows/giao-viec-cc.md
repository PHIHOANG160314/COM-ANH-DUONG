---
description: Giao việc cho Claude Code CLI tự động, tự accept không hỏi
---

# Workflow: Giao Việc Claude Code CLI

Workflow này tự động mở terminal, giao việc cho Claude Code CLI và tự accept.
**Sử dụng Antigravity Claude Proxy + Global Command File**

// turbo-all

## Các bước thực hiện

### 1. Kiểm tra Proxy hoạt động (macOS)

```bash
curl -s http://localhost:8080/health | jq '.available, .total' || echo "⚠️ Proxy not running"
```

### 2. Set Environment và chạy Claude CLI

```bash
# Antigravity Proxy Configuration
export ANTHROPIC_BASE_URL="http://localhost:8080"
export ANTHROPIC_API_KEY="dummy"
export ANTHROPIC_MODEL="gemini-3-pro-high[1m]"

# Chạy Claude với dangerously-skip-permissions (auto-accept)
cd {PROJECT_DIR} && claude --dangerously-skip-permissions
```

### 3. Gửi Task (2 bước riêng biệt)

**Bước 3a**: Gửi text task (KHÔNG có `\n` ở cuối)

```
{TASK_DESCRIPTION}
```

**Bước 3b**: Gửi Enter riêng biệt

```
\n
```

### 4. Monitor Output

Dùng `command_status` để theo dõi tiến trình với WaitDurationSeconds=60-90

## Global Command File Pattern

Thay vì gõ trực tiếp, tạo file `.claude-task.md` trong project:

```bash
# Tạo task file
cat > .claude-task.md << 'EOF'
# Task: {TASK_NAME}
{DETAILED_INSTRUCTIONS}
EOF

# Gửi vào CC CLI
Read .claude-task.md and execute ALL tasks
```

## Available Models (v2.4.2)

| Model                        | Description          |
| ---------------------------- | -------------------- |
| `gemini-3-pro-high[1m]`      | Pro tier, 1M context |
| `gemini-3-flash[1m]`         | Nhanh, 1M context    |
| `claude-sonnet-4-5-thinking` | Thinking mode        |

## Lưu ý Quan Trọng

- Flag `--dangerously-skip-permissions` tự động accept mọi thay đổi
- **LUÔN dùng global command file** `.claude-task.md` cho complex tasks
- Suffix `[1m]` kích hoạt 1M tokens context
- Monitor bằng `command_status` với OutputCharacterCount=10000

## 🎯 Hướng Dẫn Chọn Model (Token Optimization)

### Nguyên tắc Vàng
| Loại Task | Model Đề Xuất | Token Est. |
|-----------|---------------|------------|
| Fix bug đơn giản, lint, format | `gemini-3-flash[1m]` | ~2K |
| Coding thông thường, planning | `gemini-3-pro-high[1m]` | ~5K |
| Phân tích phức tạp, refactor lớn | `gemini-3-pro-high[1m]` | ~10K |
| Reasoning, chain-of-thought | `claude-sonnet-4-5-thinking` | ~15K |

### Script Chọn Model Tự Động
```powershell
# Chọn theo độ phức tạp
. .\scripts\select-model.ps1 -Complexity simple   # Flash - tiết kiệm
. .\scripts\select-model.ps1 -Complexity medium   # Pro - cân bằng
. .\scripts\select-model.ps1 -Complexity complex  # Pro - chất lượng
. .\scripts\select-model.ps1 -Complexity thinking # Claude - reasoning
```

### Prompt Compression Tips
1. **Dùng Reference**: `Read file X and fix bug` thay vì paste code
2. **Dùng Global File**: `.claude-task.md` cho tasks phức tạp
3. **Tránh lặp lại**: Không paste context đã có trong file

## Ví dụ sử dụng

```bash
# Cách 1: Inline task
claude --dangerously-skip-permissions -p "Fix bug X"

# Cách 2: Global command file (RECOMMENDED)
cat > .claude-task.md << 'EOF'
# Mission: Fix all bugs
1. Bug A - details
2. Bug B - details
EOF
claude --dangerously-skip-permissions
# Sau đó gửi: Read .claude-task.md and execute ALL tasks
```
