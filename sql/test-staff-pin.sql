-- =====================================================
-- TEST verify_staff_pin FUNCTION
-- =====================================================

-- Test 1: Thử PIN Thu Ngân (1818)
SELECT * FROM verify_staff_pin('', '1818');

-- Test 2: Thử PIN Phục Vụ 1 (1811)
SELECT * FROM verify_staff_pin('', '1811');

-- Test 3: Thử PIN sai (9999)
SELECT * FROM verify_staff_pin('', '9999');

-- Test 4: Kiểm tra staff có tồn tại không
SELECT id, name, role, is_active FROM staff;
