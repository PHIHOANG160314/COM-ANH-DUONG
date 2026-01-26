# Chiến Lược Tổng Thể Cơm Ánh Dương (Binh Pháp)

## 1. Phân Tích Hiện Trạng (Current State)

### Điểm Mạnh
- **Giao diện**: Đã bắt đầu chuyển đổi sang Material Design 3 (Modern UI).
- **Hạ tầng**: Có CI/CD pipeline với GitHub Actions và Vercel.
- **Dữ liệu**: Có cấu trúc database SQL rõ ràng (Supabase) hỗ trợ Realtime.
- **Tối ưu**: Đã có quy trình minification (clean-css, terser).

### Điểm Yếu
- **Tính năng**: Chưa hoàn thiện realtime monitoring (theo dõi đơn hàng thời gian thực).
- **Trải nghiệm**: Một số trang vẫn dùng UI cũ, chưa đồng bộ hoàn toàn M3.
- **Vận hành**: Chưa có dashboard quản lý tập trung hiệu quả cho nhân viên/bếp.

---

## 2. Chiến Lược Kinh Doanh (Business Strategy)

### Mục Tiêu (KPIs)
- **Tăng trưởng đơn hàng**: +30% đơn hàng online trong Q1/2026.
- **Tối ưu vận hành**: Giảm thời gian từ "Đặt món" -> "Bếp nhận" xuống < 5 giây.
- **Trải nghiệm khách hàng**: Đạt rating 4.8/5 sao trên ứng dụng.

### Định Vị Thương Hiệu (Brand Positioning)
- **"Cơm Ngon Công Nghệ"**: Kết hợp hương vị truyền thống với trải nghiệm đặt món hiện đại, nhanh chóng.
- **Premium Mass-market**: Chất lượng cao cấp nhưng giá cả tiếp cận được số đông.

---

## 3. Lộ Trình Kỹ Thuật (Technical Roadmap)

### Giai Đoạn 1: Tối Ưu & Đồng Bộ (Tuần 1-2)
- **UI/UX Upgrade**: Hoàn tất chuyển đổi 100% sang Material Design 3 cho `customer.html`, `staff-mobile.html`.
- **Performance**: Nâng điểm Lighthouse > 95 (Core Web Vitals).
- **Proxy Stability**: Đảm bảo quy trình `claude-gemini.ps1` hoạt động ổn định cho dev.

### Giai Đoạn 2: Realtime & Automation (Tuần 3-4)
- **Supabase Realtime**: Kích hoạt tính năng theo dõi đơn hàng live cho Bếp và Admin.
- **Notification**: Tích hợp Web Push Notification cho nhân viên khi có đơn mới.
- **Analytics Dashboard**: Xây dựng admin dashboard với biểu đồ doanh thu, món bán chạy (sử dụng SQL analytics có sẵn).

### Giai Đoạn 3: Mở Rộng (Tháng 2)
- **Loyalty Program**: Tích điểm đổi quà.
- **AI Recommendation**: Gợi ý món ăn dựa trên lịch sử đặt hàng (Basic).

---

## 4. Chiến Lược Triển Khai (Deployment Strategy)

- **Môi trường**:
    - `Production`: comanhduong.com (Vercel)
    - `Staging/Preview`: PR previews trên Vercel.
- **Quy trình**:
    - Code -> PR -> CI/CD (Validate + Build) -> Preview -> Review -> Merge -> Deploy Prod.
- **Database**:
    - Supabase Managed Postgres.
    - Migrations quản lý qua file SQL trong thư mục `sql/`.

---

## 5. Marketing & Vận Hành (Marketing & Operations)

- **Marketing**:
    - SEO: Tối ưu `sitemap.xml`, `robots.txt` và meta tags cho từng món ăn.
    - Social Share: Tối ưu hiển thị khi share link thực đơn lên Facebook/Zalo.
- **Vận Hành (SOP)**:
    - **Sáng**: Nhân viên check-in `staff-mobile.html`, hệ thống auto-open quán.
    - **Trong ngày**: Bếp dùng `kitchen.html` (màn hình ngang) để nhận đơn. Shipper dùng `shipper.html`.
    - **Tối**: Hệ thống chốt sổ, gửi báo cáo doanh thu qua Telegram/Email cho chủ quán.

---

## 6. Action Items (Tuần Này - Ưu Tiên Cao)

🔴 **High Priority (Phải làm ngay)**
- [x] Chạy lại `claude-gemini.ps1` để đảm bảo proxy dev environment ổn định. ✅ Proxy running at localhost:8080
- [x] Kiểm tra và merge các file SQL cập nhật (`sql/phase2-security-combined.sql`) để fix lỗi RLS. ✅ Đã tích hợp vào `admin-credentials.js` và `kitchen-auth.js`
- [x] Hoàn thiện giao diện `kitchen.html` để Bếp có thể test ngay. ✅ Realtime sync đã fix trong `kitchen.js`

🟡 **Medium Priority**
- [ ] Refactor CSS để dùng biến màu chuẩn `design-system.css`.
- [ ] Setup `marketing` meta tags cho trang chủ.

🟢 **Low Priority**
- [ ] Research AI recommendation engine.

---

## Metric Theo Dõi
- **Load Time**: < 1.5s
- **Order Success Rate**: > 99%
- **Error Rate**: < 1%
