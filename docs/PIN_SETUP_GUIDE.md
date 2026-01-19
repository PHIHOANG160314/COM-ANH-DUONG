# 🔐 Hướng Dẫn Tạo & Đổi PIN

## Tổng Quan

Hệ thống có 4 loại tài khoản cần PIN:

| Loại | Trang | Database |
|------|-------|----------|
| **Admin** | `/admin` | `staff` table |
| **Staff** | `/staff` | `staff` table |
| **Kitchen** | `/kitchen` | `kitchen_accounts` table |
| **Shipper** | `/shipper` | `shippers` table |

---

## 1️⃣ Tạo Tài Khoản Staff/Admin

### Bước 1: Mở Supabase SQL Editor
1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Click **SQL Editor** ở sidebar

### Bước 2: Chạy lệnh tạo tài khoản

**Tạo Admin:**
```sql
INSERT INTO staff (name, role, pin, phone) VALUES
('Tên Admin', 'admin', crypt('1234', gen_salt('bf', 8)), '0123456789');
```

**Tạo Staff:**
```sql
INSERT INTO staff (name, role, pin, phone) VALUES
('Tên Nhân Viên', 'manager', crypt('5678', gen_salt('bf', 8)), '0987654321');
```

**Roles có sẵn:**
- `admin` - Quản lý (full quyền)
- `manager` - Thu ngân
- `waiter` - Phục vụ
- `chef` - Bếp

### Bước 3: Test đăng nhập
1. Vào `comanhduong.com/admin` hoặc `/staff`
2. Nhập PIN vừa tạo (VD: `1234`)
3. Nếu thành công → Hoàn tất ✅

---

## 2️⃣ Tạo Tài Khoản Kitchen

### Option A: Demo Mode (Không cần SQL)
Kitchen đã có demo accounts sẵn:

| Tên | PIN |
|-----|-----|
| Bếp Chính | 1234 |
| Bếp 1 | 1111 |
| Bếp 2 | 2222 |

### Option B: Database (Production)

**Bước 1:** Chạy SQL script tạo bảng:
```sql
-- Paste toàn bộ nội dung từ file: sql/kitchen-accounts.sql
```

**Bước 2:** Tạo tài khoản:
```sql
INSERT INTO kitchen_accounts (name, pin_hash)
VALUES ('Tên Bếp', crypt('4321', gen_salt('bf')));
```

**Bước 3:** Test tại `comanhduong.com/kitchen`

---

## 3️⃣ Tạo Tài Khoản Shipper

### Cách 1: Qua Admin Portal (Khuyến nghị)
1. Đăng nhập `/admin`
2. Click menu **Shipper** 
3. Click **+ Thêm Shipper**
4. Điền form:
   - **Tên**: Tên shipper
   - **SĐT**: Số điện thoại
   - **PIN**: 4 chữ số
5. Click **Lưu**
6. Hệ thống tự tạo PIN hash

### Cách 2: SQL Trực Tiếp
```sql
SELECT admin_create_shipper('Tên Shipper', '0901234567', '6789');
```

---

## 🔄 Đổi PIN

### Admin/Staff PIN
**Cách 1: Qua SQL**
```sql
SELECT change_staff_pin(
  '<staff_id>',  -- UUID của staff
  '1234',        -- PIN cũ
  '5678'         -- PIN mới
);
```

**Cách 2: Tìm staff_id**
```sql
SELECT id, name, role FROM staff WHERE name = 'Tên Nhân Viên';
```

### Kitchen PIN
```sql
SELECT admin_reset_kitchen_pin(
  '<account_id>',  -- UUID
  '9999'           -- PIN mới
);
```

### Shipper PIN
**Qua Admin Portal:**
1. Vào `/admin` → **Shipper**
2. Click nút **🔑** (Reset PIN)
3. Nhập PIN mới
4. **Lưu**

**Qua SQL:**
```sql
SELECT admin_reset_shipper_pin('<shipper_id>', '1111');
```

---

## 📋 Demo PINs Hiện Có

> ⚠️ **CHỈ DÙNG ĐỂ TEST**

### Kitchen (Demo Mode)
```
Bếp Chính: 1234
Bếp 1: 1111  
Bếp 2: 2222
```

### Staff/Admin
**Cần tạo trong Supabase** (xem phần 1)

### Shipper
**Cần tạo qua Admin Portal** (xem phần 3)

---

## ⚙️ Scripts SQL Cần Chạy

Nếu chưa chạy các script này, hãy chạy theo thứ tự:

1. **Staff Schema:**
   ```bash
   File: sql/staff-schema.sql
   ```

2. **Shipper Schema:**
   ```bash
   File: sql/shipper-schema.sql
   File: sql/shipper-security-enhancements.sql
   ```

3. **Kitchen Schema:**
   ```bash
   File: sql/kitchen-accounts.sql
   ```

---

## 🔍 Kiểm Tra Tài Khoản

### Xem tất cả Staff
```sql
SELECT id, name, role, phone, is_active, last_login 
FROM staff 
ORDER BY created_at DESC;
```

### Xem tất cả Kitchen
```sql
SELECT id, name, is_active, last_login_at 
FROM kitchen_accounts 
ORDER BY created_at DESC;
```

### Xem tất cả Shipper
```sql
SELECT id, name, phone, status, is_active, last_login_at 
FROM shippers 
ORDER BY created_at DESC;
```

---

## 🚨 Troubleshooting

### "Mã PIN không đúng"
- **Admin/Staff**: Kiểm tra PIN đã tạo trong SQL
- **Kitchen**: Thử demo PIN: `Bếp Chính` / `1234`
- **Shipper**: Reset PIN qua Admin Portal

### "Lỗi xác thực" 
- Chưa chạy SQL script → Xem mục Scripts SQL
- Database chưa có RPC functions

### "Tài khoản bị khóa"
```sql
-- Mở khóa Staff
UPDATE staff SET is_active = true, locked_until = NULL WHERE id = '<staff_id>';

-- Mở khóa Kitchen
UPDATE kitchen_accounts SET is_active = true WHERE id = '<account_id>';

-- Mở khóa Shipper
UPDATE shippers SET is_active = true WHERE id = '<shipper_id>';
```

---

## 📞 Liên Hệ

Nếu cần hỗ trợ, vui lòng cung cấp:
- Loại tài khoản (Admin/Staff/Kitchen/Shipper)
- Tên tài khoản
- Lỗi gặp phải (screenshot nếu có)
