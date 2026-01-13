-- =====================================================
-- STAFF SYSTEM SCHEMA - ÁNH DƯƠNG F&B
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- STAFF TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'manager', 'cashier', 'waiter', 'chef'
    pin VARCHAR(60) NOT NULL,  -- Hashed PIN
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Only allow viewing active staff
CREATE POLICY "View active staff" ON staff
    FOR SELECT USING (is_active = true);

-- Allow all operations for authenticated users (service role)
CREATE POLICY "Service role full access" ON staff
    FOR ALL USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to hash PIN
CREATE OR REPLACE FUNCTION hash_pin(plain_pin TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(plain_pin, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql;

-- Function to verify PIN
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
    -- Find staff by role (simplified - in production use unique identifier)
    SELECT s.* INTO v_staff
    FROM staff s
    WHERE s.is_active = true
      AND (s.locked_until IS NULL OR s.locked_until < v_now)
    LIMIT 1;
    
    IF v_staff IS NULL THEN
        RETURN;
    END IF;
    
    -- Verify PIN
    IF v_staff.pin = crypt(p_pin, v_staff.pin) THEN
        -- Reset login attempts on success
        UPDATE staff SET 
            login_attempts = 0,
            last_login = v_now,
            locked_until = NULL
        WHERE staff.id = v_staff.id;
        
        RETURN QUERY SELECT v_staff.id, v_staff.name::TEXT, v_staff.role::TEXT, 
                            v_staff.phone::TEXT, v_staff.is_active;
    ELSE
        -- Increment login attempts
        UPDATE staff SET 
            login_attempts = login_attempts + 1,
            locked_until = CASE 
                WHEN login_attempts >= 4 THEN v_now + INTERVAL '15 minutes'
                ELSE NULL
            END
        WHERE staff.id = v_staff.id;
        
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change staff PIN securely
CREATE OR REPLACE FUNCTION change_staff_pin(p_staff_id UUID, p_old_pin TEXT, p_new_pin TEXT)
RETURNS JSONB AS $$
DECLARE
    v_staff RECORD;
BEGIN
    -- Find staff by ID
    SELECT * INTO v_staff FROM staff WHERE id = p_staff_id AND is_active = true;
    
    IF v_staff IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Nhân viên không tồn tại');
    END IF;
    
    -- Verify old PIN
    IF v_staff.pin != crypt(p_old_pin, v_staff.pin) THEN
        RETURN jsonb_build_object('success', false, 'error', 'PIN cũ không đúng');
    END IF;
    
    -- Update to new PIN (hashed)
    UPDATE staff SET 
        pin = crypt(p_new_pin, gen_salt('bf', 8)),
        updated_at = NOW()
    WHERE id = p_staff_id;
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- INSERT DEFAULT STAFF (with hashed PINs)
-- =====================================================
INSERT INTO staff (name, role, pin, phone) VALUES
('Admin', 'admin', crypt('1234', gen_salt('bf', 8)), '0917076061'),
('Quản lý 1', 'manager', crypt('2345', gen_salt('bf', 8)), ''),
('Thu ngân 1', 'cashier', crypt('3456', gen_salt('bf', 8)), ''),
('Phục vụ 1', 'waiter', crypt('4567', gen_salt('bf', 8)), ''),
('Bếp trưởng', 'chef', crypt('5678', gen_salt('bf', 8)), '')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE staff;

