# 📚 Hướng Dẫn Sử Dụng Hệ Thống F&B Master

## 🎯 Tổng Quan

F&B Master là hệ thống quản lý nhà hàng toàn diện với 3 giao diện chính:
1. **Admin Dashboard** (`index.html`) - Quản lý tổng thể
2. **Customer Portal** (`customer.html`) - Khách hàng đặt món
3. **Staff Mobile** (`staff-mobile.html`) - Nhân viên sử dụng

---

## 👤 Đăng Nhập Nhân Viên

### Tài Khoản Mặc Định

| Họ Tên | Chức Vụ | Mã PIN |
|--------|---------|--------|
| Admin | Admin | `1234` |
| Quản lý 1 | Manager | `2345` |
| Nhân viên 1 | Staff | `3456` |
| Nhân viên 2 | Staff | `4567` |
| Bếp trưởng | Manager | `5678` |

> ⚠️ **Quan trọng:** Đổi mã PIN ngay sau khi đăng nhập lần đầu!

### Cách Đăng Nhập

1. Mở Staff Portal (`/staff-mobile.html`)
2. Nhập mã PIN 4 số
3. Nhấn "Đăng nhập"

---

## 📱 Hướng Dẫn Theo Vai Trò

### 🍳 Nhân Viên Bếp

1. **Check-in đầu ca**
   - Nhấn nút "Check-in" trên trang chủ
   - Thời gian check-in sẽ được ghi nhận

2. **Xem đơn cần làm**
   - Vào tab "Bếp" (👨‍🍳)
   - Các đơn mới sẽ hiển thị theo thứ tự
   - Màu sắc: 
     - 🔴 Đỏ = Khẩn cấp (đợi lâu)
     - 🟡 Vàng = Bình thường
     - 🟢 Xanh = Vừa vào

3. **Hoàn thành món**
   - Nhấn vào đơn hàng
   - Tick "Hoàn thành" cho từng món
   - Khi xong hết nhấn "Sẵn sàng phục vụ"

### 🛒 Nhân Viên Phục Vụ

1. **Tạo đơn hàng**
   - Vào POS (index.html)
   - Chọn bàn/mang đi
   - Thêm món từ menu
   - Nhấn "Thanh toán"

2. **Kiểm tra đơn**
   - Tab "Quản lý đơn" (📋)
   - Kéo thả để chuyển trạng thái

3. **Giao món cho khách**
   - Khi thấy đơn "Sẵn sàng"
   - Nhấn "Đã giao" sau khi phục vụ

### 👔 Quản Lý

Ngoài các chức năng nhân viên, quản lý có thêm:

1. **Dashboard** - Xem doanh thu, thống kê
2. **Kho hàng** - Kiểm tra nguyên liệu
3. **Nhân viên** - Quản lý ca, lương
4. **Báo cáo** - Xuất báo cáo Excel

---

## 📲 Cài Đặt App (PWA)

### Trên iPhone/iPad

1. Mở Safari → Vào `comanhduong.com`
2. Nhấn nút chia sẻ (⬆️)
3. Chọn "Thêm vào Màn hình chính"
4. Đặt tên → Thêm

### Trên Android

1. Mở Chrome → Vào `comanhduong.com`
2. Nhấn menu (⋮) → "Thêm vào màn hình chính"
3. Hoặc nhấn popup "Cài đặt" khi hiện

---

## 🆘 Xử Lý Sự Cố

| Vấn đề | Giải pháp |
|--------|-----------|
| Không đăng nhập được | Kiểm tra lại mã PIN, liên hệ quản lý |
| Màn hình trắng | Reload trang (F5 hoặc kéo từ trên xuống) |
| Mất đơn hàng | Đơn đã lưu tự động, reload trang |
| Không thấy menu | Kiểm tra kết nối internet |

---

## 📞 Liên Hệ Hỗ Trợ

- **Quản lý ca:** [Tên quản lý]
- **IT Support:** [Email/SĐT]
- **Đường dây nóng:** 0917 076 061

---

*Cập nhật: 30/12/2024*
