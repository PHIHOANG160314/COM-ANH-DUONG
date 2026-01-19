-- =====================================================
-- COMPLETE STAFF SETUP - ALL IN ONE
-- Chạy script này 1 lần để fix tất cả
-- =====================================================

-- STEP 1: Xóa TẤT CẢ staff hiện có (reset clean)
DELETE FROM staff;

-- STEP 2: Fix verify_staff_pin function
DROP FUNCTION IF EXISTS verify_staff_pin(TEXT, TEXT);

CREATE OR REPLACE FUNCTION verify_staff_pin(p_role TEXT, p_pin TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    role TEXT,
    phone TEXT,
    is_active BOOLEAN
) AS $$
DECLARE
    v_staff RECORD;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Duyệt qua tất cả staff active để tìm PIN khớp
    FOR v_staff IN 
        SELECT s.*
        FROM staff s
        WHERE s.is_active = true
          AND (s.locked_until IS NULL OR s.locked_until < v_now)
    LOOP
        -- Kiểm tra PIN
        IF v_staff.pin = crypt(p_pin, v_staff.pin) THEN
            -- Reset login attempts on success
            UPDATE staff SET 
                login_attempts = 0,
                last_login = v_now,
                locked_until = NULL
            WHERE staff.id = v_staff.id;
            
            -- Return thông tin staff
            RETURN QUERY SELECT 
                v_staff.id, 
                v_staff.name::TEXT, 
                v_staff.role::TEXT,
                v_staff.phone::TEXT, 
                v_staff.is_active;
            RETURN;
        END IF;
    END LOOP;
    
    -- Không tìm thấy PIN khớp
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Tạo lại tài khoản staff
INSERT INTO staff (name, role, pin, phone) VALUES
('Thu Ngân', 'manager', crypt('1818', gen_salt('bf', 8)), ''),
('Phục Vụ 1', 'waiter', crypt('1811', gen_salt('bf', 8)), ''),
('Phục Vụ 2', 'waiter', crypt('1812', gen_salt('bf', 8)), ''),
('Phục Vụ 3', 'waiter', crypt('1813', gen_salt('bf', 8)), ''),
('Phục Vụ 4', 'waiter', crypt('1814', gen_salt('bf', 8)), '');

-- STEP 4: Test ngay trong SQL (QUAN TRỌNG!)
-- Test Pin Thu Ngân
DO $$
DECLARE
    v_result RECORD;
BEGIN
    SELECT * INTO v_result FROM verify_staff_pin('', '1818');
    IF v_result.name IS NOT NULL THEN
        RAISE NOTICE '✅ TEST PASS: Pin 1818 -> %', v_result.name;
    ELSE
        RAISE NOTICE '❌ TEST FAIL: Pin 1818 không khớp';
    END IF;
END $$;

-- Test Pin Phục Vụ 1
DO $$
DECLARE
    v_result RECORD;
BEGIN
    SELECT * INTO v_result FROM verify_staff_pin('', '1811');
    IF v_result.name IS NOT NULL THEN
        RAISE NOTICE '✅ TEST PASS: Pin 1811 -> %', v_result.name;
    ELSE
        RAISE NOTICE '❌ TEST FAIL: Pin 1811 không khớp';
    END IF;
END $$;

-- STEP 5: Hiển thị kết quả cuối cùng
SELECT 
    '=== STAFF ACCOUNTS ===' as info,
    name,
    role,
    is_active,
    created_at
FROM staff
ORDER BY role, name;
