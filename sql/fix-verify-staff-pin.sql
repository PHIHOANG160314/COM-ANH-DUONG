-- =====================================================
-- FIX verify_staff_pin FUNCTION
-- Bug: Function không tìm staff theo PIN
-- =====================================================

-- Xóa function cũ
DROP FUNCTION IF EXISTS verify_staff_pin(TEXT, TEXT);

-- Tạo lại function đúng
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
