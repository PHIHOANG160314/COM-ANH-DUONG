-- =====================================================
-- TẠO TÀI KHOẢN ADMIN
-- Để tạo mã làm việc cho Staff/Phục vụ
-- =====================================================

INSERT INTO staff (name, role, pin, phone) VALUES
('Admin', 'admin', crypt('0000', gen_salt('bf', 8)), '0123456789');

-- Kiểm tra kết quả
SELECT 
    name,
    role,
    phone,
    is_active,
    created_at
FROM staff
WHERE role = 'admin'
ORDER BY created_at DESC;
