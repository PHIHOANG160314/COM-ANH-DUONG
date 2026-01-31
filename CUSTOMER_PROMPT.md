# 🚀 Prompt Cho Khách Chạy Antigravity IDE (Lần 3 - Final Setup)

> Copy toàn bộ prompt bên dưới và paste vào Antigravity IDE

---

## PROMPT:

```
Tôi cần hoàn thiện setup project Cơm Ánh Dương. Đây là lần chạy thứ 3 (FINAL SETUP).

## CURRENT STATUS:
✅ Site live: https://comanhduong.com
✅ CI/CD 100% passed (commit 0ff7ea8)
✅ Demo mode hoạt động - hiển thị 3 món: Cơm Sườn Nướng, Cơm Gà Xối Mỡ, Cơm Tấm Bì Chả
✅ Graceful fallback khi Supabase lỗi
⚠️ Đang dùng demo data - cần config Supabase thật

## VẤN ĐỀ CẦN FIX:
Website đang dùng demo data vì chưa có Supabase credentials thật.
Console có warning: "⚠️ Supabase not configured - showing demo menu"

## TASKS KHÁCH CẦN LÀM:

### Bước 1: Lấy Supabase Credentials
1. Vào https://supabase.com → Đăng nhập
2. Chọn/tạo project "com-anh-duong" (Region: Singapore)
3. Vào Settings → API
4. Copy:
   - Project URL (dạng: https://xxx.supabase.co)
   - anon public key (dạng: eyJhbGciOiJIUzI1NiIs...)

### Bước 2: Cập nhật Vercel Environment Variables
1. Vào https://vercel.com → chọn project com-anh-duong
2. Settings → Environment Variables
3. Thêm/Update 2 biến (tất cả environments):
   - VITE_SUPABASE_URL = [Project URL từ bước 1]
   - VITE_SUPABASE_ANON_KEY = [anon key từ bước 1]
4. Click Save

### Bước 3: Chạy Database Migrations
1. Vào Supabase Dashboard → SQL Editor
2. Clone repo: git clone https://github.com/PHIHOANG160314/COM-ANH-DUONG.git
3. Chạy lần lượt từ react-app/supabase/migrations/:
   - 20260131_initial_schema.sql
   - 20260131_rls_policies.sql
   - 20260131_create_payment_transactions.sql
   - 20260131_loyalty_schema.sql
   - 20260131_loyalty_triggers.sql
   - 20260131_inventory_schema.sql
   - 20260131_checkout_loyalty.sql
   - 20260131_notifications_schema.sql
   - 20260131_analytics_functions.sql
   - 20260131_enable_cron.sql
   - 20260131_enable_daily_report.sql

### Bước 4: Seed Data
Chạy file: react-app/supabase/seed.sql

### Bước 5: Redeploy
1. Vercel Dashboard → Deployments
2. Click "..." → Redeploy
3. Đợi deploy xong (~2 phút)

### Bước 6: Verify
1. Mở https://comanhduong.com
2. Menu phải load từ database thật (không còn demo)
3. Thử đặt hàng 1 món

## OUTPUT:
- Screenshots mỗi bước hoàn thành
- Báo lỗi nếu có
- Confirm khi site load data thật
```

---

## 📝 Hướng dẫn cho anh:

1. Gửi file này cho khách
2. Khách copy prompt ở trên
3. Paste vào Antigravity IDE chat
4. IDE sẽ hướng dẫn từng bước

**Khách cần có:**

- ✅ Tài khoản Vercel (owner của project)
- ✅ Tài khoản Supabase
- ✅ Quyền edit environment variables

**Timeline:** ~15-20 phút nếu làm đúng theo hướng dẫn

---

## 📊 Lịch sử các phiên:

| Lần | Ngày       | Nội dung                                |
| --- | ---------- | --------------------------------------- |
| 1   | 30/01/2026 | Initial setup, fix i18n, menu showcase  |
| 2   | 31/01/2026 | CI/CD fixes, demo fallback              |
| 3   | 31/01/2026 | **Supabase production setup** (current) |
