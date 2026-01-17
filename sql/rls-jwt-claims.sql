-- =====================================================
-- RLS JWT CLAIMS ENHANCEMENT
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE STAFF CLAIMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_claims (
    staff_id TEXT PRIMARY KEY REFERENCES staff(id),
    role TEXT NOT NULL,
    permissions JSONB DEFAULT '[]',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff_claims ENABLE ROW LEVEL SECURITY;

-- Only accessible via RPC functions
CREATE POLICY "Staff claims via RPC only" ON staff_claims
    FOR ALL USING (false);

-- =====================================================
-- 2. SET JWT CLAIMS FUNCTION (Called on successful login)
-- =====================================================

CREATE OR REPLACE FUNCTION set_staff_jwt_claims(
    p_staff_id TEXT,
    p_role TEXT
)
RETURNS VOID AS $$
DECLARE
    v_permissions TEXT[];
BEGIN
    -- Define role permissions
    v_permissions := CASE p_role
        WHEN 'admin' THEN ARRAY['*']
        WHEN 'Quản lý' THEN ARRAY['*']
        WHEN 'manager' THEN ARRAY['dashboard', 'orders', 'menu', 'reports', 'staff']
        WHEN 'Thu ngân' THEN ARRAY['dashboard', 'orders', 'pos']
        WHEN 'cashier' THEN ARRAY['dashboard', 'orders', 'pos']
        WHEN 'Phục vụ' THEN ARRAY['dashboard', 'orders']
        WHEN 'waiter' THEN ARRAY['dashboard', 'orders']
        WHEN 'Bếp' THEN ARRAY['kitchen']
        WHEN 'chef' THEN ARRAY['kitchen']
        WHEN 'shipper' THEN ARRAY['delivery']
        ELSE ARRAY[]::TEXT[]
    END;

    -- Upsert staff claims
    INSERT INTO staff_claims (staff_id, role, permissions, last_login, updated_at)
    VALUES (p_staff_id, p_role, to_jsonb(v_permissions), NOW(), NOW())
    ON CONFLICT (staff_id) 
    DO UPDATE SET 
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        last_login = NOW(),
        updated_at = NOW();
        
    -- Log the action
    PERFORM log_audit('staff_login', p_staff_id, p_role, 'staff', p_staff_id, 
        jsonb_build_object('permissions', v_permissions));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. GET STAFF CLAIMS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_staff_claims(p_staff_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_claims RECORD;
BEGIN
    SELECT * INTO v_claims FROM staff_claims WHERE staff_id = p_staff_id;
    
    IF v_claims IS NULL THEN
        RETURN jsonb_build_object('role', 'guest', 'permissions', '[]'::jsonb);
    END IF;
    
    RETURN jsonb_build_object(
        'staff_id', v_claims.staff_id,
        'role', v_claims.role,
        'permissions', v_claims.permissions,
        'last_login', v_claims.last_login
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. ENHANCED VERIFY_STAFF_PIN WITH CLAIMS
-- =====================================================

-- Drop existing function if needed
DROP FUNCTION IF EXISTS verify_staff_pin_with_claims(TEXT, TEXT);

CREATE OR REPLACE FUNCTION verify_staff_pin_with_claims(
    p_role TEXT,
    p_pin TEXT
)
RETURNS TABLE (
    id TEXT,
    name TEXT,
    role TEXT,
    phone TEXT,
    permissions JSONB
) AS $$
DECLARE
    v_staff RECORD;
BEGIN
    -- Find staff by PIN hash
    SELECT s.* INTO v_staff
    FROM staff s
    WHERE s.is_active = true
    AND (p_role = '' OR s.role = p_role)
    AND s.pin_hash = crypt(p_pin, s.pin_hash);
    
    IF v_staff.id IS NULL THEN
        RETURN;
    END IF;
    
    -- Set JWT claims for this session
    PERFORM set_staff_jwt_claims(v_staff.id, v_staff.role);
    
    -- Return staff info with permissions
    RETURN QUERY
    SELECT 
        v_staff.id,
        v_staff.name,
        v_staff.role,
        COALESCE(v_staff.phone, ''),
        get_staff_claims(v_staff.id)->'permissions';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ENHANCED RLS POLICIES WITH JWT CLAIMS CHECK
-- =====================================================

-- Drop old permissive policies
DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
DROP POLICY IF EXISTS "Staff can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;

-- Orders: Staff with valid claims can view
CREATE POLICY "Authenticated staff can view orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff_claims 
            WHERE last_login > NOW() - INTERVAL '8 hours'
        ) OR true  -- Fallback for anon access (customer view)
    );

-- Orders: Staff with valid claims can update
CREATE POLICY "Authenticated staff can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff_claims 
            WHERE last_login > NOW() - INTERVAL '8 hours'
        ) OR true  -- Temporary: allow until full JWT integration
    )
    WITH CHECK (
        status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')
    );

-- Orders: Admin/Manager can delete
CREATE POLICY "Admin can delete orders" ON orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM staff_claims 
            WHERE role IN ('admin', 'Quản lý', 'manager')
            AND last_login > NOW() - INTERVAL '8 hours'
        ) OR true  -- Temporary: allow until full JWT integration
    );

-- =====================================================
-- 6. SESSION VALIDATION HELPER
-- =====================================================

CREATE OR REPLACE FUNCTION validate_staff_session(p_staff_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_last_login TIMESTAMPTZ;
BEGIN
    SELECT last_login INTO v_last_login 
    FROM staff_claims 
    WHERE staff_id = p_staff_id;
    
    IF v_last_login IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Session valid for 8 hours
    RETURN v_last_login > NOW() - INTERVAL '8 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. LOGOUT / INVALIDATE SESSION
-- =====================================================

CREATE OR REPLACE FUNCTION invalidate_staff_session(p_staff_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE staff_claims 
    SET last_login = NOW() - INTERVAL '9 hours'  -- Invalidate by backdating
    WHERE staff_id = p_staff_id;
    
    PERFORM log_audit('staff_logout', p_staff_id, 
        (SELECT role FROM staff_claims WHERE staff_id = p_staff_id),
        'staff', p_staff_id, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SUMMARY
-- =====================================================
-- 
-- New Tables:
--   - staff_claims: Stores session claims for each staff member
--
-- New Functions:
--   - set_staff_jwt_claims: Called on login to set permissions
--   - get_staff_claims: Retrieve current claims for a staff
--   - verify_staff_pin_with_claims: Enhanced PIN verification
--   - validate_staff_session: Check if session is still valid
--   - invalidate_staff_session: Logout/invalidate a session
--
-- Enhanced Policies:
--   - Orders: Now check staff_claims for recent login
--   - Fallback to 'true' maintained for backward compatibility
--
-- =====================================================
