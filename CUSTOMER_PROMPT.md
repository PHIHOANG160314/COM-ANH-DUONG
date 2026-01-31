# 🚀 Prompt Cho Khách Chạy Antigravity IDE (Lần 2 - Update)

> Copy toàn bộ prompt bên dưới và paste vào Antigravity IDE

---

## PROMPT:

```
Tôi cần hoàn thiện setup project Cơm Ánh Dương. Đây là lần chạy thứ 2 để update.

## CONTEXT:
- Site đã live: https://comanhduong.com
- CI/CD đã pass, demo mode hoạt động
- Cần config Supabase thật để unlock full features

## TASKS (theo thứ tự):

### 1. Kiểm tra Vercel Environment Variables
- Vào https://vercel.com → Project Settings → Environment Variables
- Đảm bảo có 2 biến sau với giá trị THẬT (không phải placeholder):
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

### 2. Nếu chưa có Supabase project, tạo mới:
- Vào https://supabase.com → New Project
- Tên: com-anh-duong
- Region: Singapore (Southeast Asia)
- Copy URL và anon key → paste vào Vercel

### 3. Chạy SQL Migrations (đã có sẵn trên Git)
- Vào Supabase Dashboard → SQL Editor
- Clone repo hoặc mở từ GitHub
- Chạy lần lượt theo thứ tự:
  1. 20260131_initial_schema.sql (schema gốc)
  2. 20260131_rls_policies.sql (security)
  3. 20260131_create_payment_transactions.sql
  4. 20260131_loyalty_schema.sql
  5. 20260131_loyalty_triggers.sql
  6. 20260131_inventory_schema.sql
  7. 20260131_checkout_loyalty.sql
  8. 20260131_notifications_schema.sql
  9. 20260131_analytics_functions.sql
  10. 20260131_enable_cron.sql
  11. 20260131_enable_daily_report.sql

### 4. Seed Demo Data
- Chạy: `react-app/supabase/seed.sql`

### 5. Trigger Vercel Redeploy
- Vercel → Deployments → Redeploy

### 6. Verify
- Vào https://comanhduong.com
- Kiểm tra menu load từ database thật
- Test đặt hàng thử

## OUTPUT MÔ TẢ:
- Screenshot mỗi bước hoàn thành
- Báo cáo status cuối cùng
```

---

## 📝 Hướng dẫn cho anh:

1. Gửi file này cho khách
2. Khách copy prompt ở trên
3. Paste vào Antigravity IDE chat
4. IDE sẽ hướng dẫn từng bước

**Lưu ý:** Khách cần có:

- Tài khoản Vercel (đã link project)
- Tài khoản Supabase
- Quyền edit environment variables
