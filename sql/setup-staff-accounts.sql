-- =====================================================
-- STAFF ACCOUNTS SETUP
-- Xóa tài khoản cũ và tạo tài khoản mới
-- =====================================================

-- BƯỚC 1: Xóa 2 tài khoản hiện có
DELETE FROM staff 
WHERE id IN (
    'cc81a06f-0767-4d4f-99c8-9f3edbb1c382',
    '62824226-edd2-4878-9130-1b0d85206e10'
);

-- BƯỚC 2: Tạo tài khoản THU NGÂN (PIN: 1818)
INSERT INTO staff (name, role, pin, phone) VALUES
('Thu Ngân', 'manager', crypt('1818', gen_salt('bf', 8)), '');

-- BƯỚC 3: Tạo 4 tài khoản PHỤC VỤ (PIN: 1811, 1812, 1813, 1814)
INSERT INTO staff (name, role, pin, phone) VALUES
('Phục Vụ 1', 'waiter', crypt('1811', gen_salt('bf', 8)), ''),
('Phục Vụ 2', 'waiter', crypt('1812', gen_salt('bf', 8)), ''),
('Phục Vụ 3', 'waiter', crypt('1813', gen_salt('bf', 8)), ''),
('Phục Vụ 4', 'waiter', crypt('1814', gen_salt('bf', 8)), '');

-- BƯỚC 4: Kiểm tra kết quả
SELECT 
    name,
    role,
    phone,
    is_active,
    created_at
FROM staff
ORDER BY role, name;
