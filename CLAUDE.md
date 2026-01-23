# Cơm Ánh Dương - Project Rules

## Tự động thực hiện (Auto-run)

Khi thực hiện task, hãy:
1. **Tự mở terminal** và chạy lệnh cần thiết
2. **Tự kiểm soát real-time** - không cần hỏi xác nhận cho các lệnh an toàn
3. **Tự verify kết quả** sau khi thực hiện

## Proxy Configuration

- **Proxy URL:** http://localhost:8080
- **Strategy:** Round-Robin (phân bổ quota đều)
- **Model mặc định:** gemini-3-pro-high[1m]

## Workflows có sẵn

- `/run` - Khởi động proxy và Claude Code CLI tự động
- `/design` - Tạo UI/UX designs
- `/supabase` - Setup Supabase database
- `/watzup` - Weekly status report
- `/binh-phap` - Strategy planning

## Quy tắc code

- Sử dụng **Material Design 3** cho UI
- CSS files nằm trong `/css/`
- JavaScript files nằm trong `/js/`
- SQL scripts nằm trong `/sql/`

## Safe commands (auto-run)

Các lệnh sau có thể tự động chạy không cần xác nhận:
- `npm install`, `npm run dev`
- `git status`, `git add`, `git commit`, `git push`
- HTTP requests đến localhost
- File read operations
