# 🔐 Hướng Dẫn Cấu Hình Bảo Mật Vercel

## Bước 1: Cấu hình Environment Variables trên Vercel

Truy cập: https://vercel.com/[your-team]/com-anh-duong/settings/environment-variables

### Thêm các biến sau:

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | `https://rnhtfaxqnvikedwufvcd.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `eyJ...` (your key) | Production, Preview, Development |
| `SENTRY_DSN` | (từ Sentry.io) | Production |
| `GA4_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Production |

## Bước 2: Xác minh triển khai

Sau khi deploy, kiểm tra:

1. Mở DevTools (F12) > Console
2. Không nên thấy warning về API keys
3. Thử `console.log(window.ENV)` - keys không nên hiển thị dạng rõ

## Bước 3: Kiểm tra CSP Headers

Mở DevTools > Network > chọn document > Headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'...
```

## Lưu ý quan trọng

⚠️ **Anon Key vs Service Key:**
- `SUPABASE_ANON_KEY`: Có thể public (RLS bảo vệ)
- `SUPABASE_SERVICE_KEY`: KHÔNG BAO GIỜ expose ra client

✅ Project này chỉ dùng Anon Key nên an toàn.

---

## Phase 2: Secure Storage & RLS JWT Claims (2026-01-15)

### Secure Storage Module

Session data giờ được mã hóa trong localStorage:

```javascript
// Kiểm tra SecureStorage hoạt động
await SecureStorage.selfTest();  // Console: "✅ SecureStorage self-test passed"

// Xem data đã mã hóa
localStorage.getItem('_sec_fb_auth_session');  // Base64 encrypted string
```

### RLS JWT Claims

Để kích hoạt JWT claims validation:

1. Mở Supabase SQL Editor
2. Chạy script: `sql/rls-jwt-claims.sql`
3. Script sẽ tạo:
   - `staff_claims` table
   - `verify_staff_pin_with_claims()` function
   - Enhanced RLS policies

### Verify Phase 2

1. **SecureStorage**: 
   - Login vào admin portal
   - Check localStorage có key bắt đầu bằng `_sec_`

2. **RLS Claims**:
   - Sau khi chạy SQL, kiểm tra trong Supabase:
   ```sql
   SELECT * FROM staff_claims;  -- Sẽ có records sau khi staff login
   ```

---

## Files đã được cập nhật

### Phase 1 (CSP & API Protection)
- [x] `js/env.js` - Enhanced với frozen config
- [x] `vercel.json` - CSP headers (đã có sẵn)
- [x] `index.html` - CSP meta tag
- [x] `customer.html` - CSP meta tag
- [x] `kitchen.html` - CSP meta tag
- [x] `staff-mobile.html` - CSP meta tag
- [x] `shipper.html` - CSP meta tag

### Phase 2 (Secure Storage & RLS)
- [x] `js/secure-storage.js` - [NEW] Web Crypto encryption
- [x] `js/auth-service.js` - SecureStorage integration
- [x] `sql/rls-jwt-claims.sql` - [NEW] RLS/JWT enhancement
- [x] `index.html` - Added secure-storage.js script
- [x] `customer.html` - Added secure-storage.js script
- [x] `kitchen.html` - Added secure-storage.js script
- [x] `staff-mobile.html` - Added secure-storage.js script
- [x] `shipper.html` - Added secure-storage.js script

