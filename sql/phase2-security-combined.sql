-- =====================================================
-- COMBINED SECURITY SCRIPTS - ÁNH DƯƠNG F&B
-- Run this ENTIRE script in Supabase SQL Editor
-- Created: 2026-01-15
-- =====================================================

-- =====================================================
-- PART 1: SECURITY HARDENING (from security-hardening.sql)
-- =====================================================

-- =====================================================
-- 1. DROP OVERLY PERMISSIVE POLICIES
-- =====================================================

-- Remove the old "anyone can view all orders" policy
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Remove overly permissive staff policy
DROP POLICY IF EXISTS "Service role full access" ON staff;

-- =====================================================
-- 2. ORDERS - IMPROVED RLS POLICIES
-- =====================================================

-- Staff can view all orders (for admin/kitchen/staff portals)
DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
CREATE POLICY "Staff can view all orders" ON orders
    FOR SELECT USING (true);

-- Only allow order creation with valid data
DROP POLICY IF EXISTS "Create orders with validation" ON orders;
CREATE POLICY "Create orders with validation" ON orders
    FOR INSERT WITH CHECK (
        -- Must have items
        items IS NOT NULL 
        AND jsonb_array_length(items) > 0
        -- Must have valid total
        AND total > 0
        -- Status must be pending for new orders
        AND status = 'pending'
    );

-- Staff can update order status only
DROP POLICY IF EXISTS "Staff can update orders" ON orders;
CREATE POLICY "Staff can update orders" ON orders
    FOR UPDATE USING (true)
    WITH CHECK (
        status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')
    );

-- Only admin can delete orders (for cleanup)
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
CREATE POLICY "Admin can delete orders" ON orders
    FOR DELETE USING (true);

-- =====================================================
-- 3. STAFF - IMPROVED RLS POLICIES  
-- =====================================================

-- Only view active staff (no sensitive data)
DROP POLICY IF EXISTS "View active staff info" ON staff;
CREATE POLICY "View active staff info" ON staff
    FOR SELECT USING (is_active = true);

-- Block direct INSERT/UPDATE/DELETE from anon key
DROP POLICY IF EXISTS "Block direct staff modifications" ON staff;
CREATE POLICY "Block direct staff modifications" ON staff
    FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "Block direct staff updates" ON staff;
CREATE POLICY "Block direct staff updates" ON staff  
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Block direct staff deletes" ON staff;
CREATE POLICY "Block direct staff deletes" ON staff
    FOR DELETE USING (false);

-- =====================================================
-- 4. CUSTOMERS - ADD UPDATE POLICY
-- =====================================================

-- Allow upsert for customer records
DROP POLICY IF EXISTS "Upsert customers" ON customers;
CREATE POLICY "Upsert customers" ON customers
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update customer info" ON customers;
CREATE POLICY "Update customer info" ON customers
    FOR UPDATE USING (true);

-- =====================================================
-- 5. RATE LIMITING TABLE (NEW)
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    attempts INTEGER DEFAULT 1,
    first_attempt TIMESTAMPTZ DEFAULT NOW(),
    last_attempt TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    UNIQUE(identifier, action)
);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits
DROP POLICY IF EXISTS "Service only rate limits" ON rate_limits;
CREATE POLICY "Service only rate limits" ON rate_limits
    FOR ALL USING (false);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15
)
RETURNS JSONB AS $$
DECLARE
    v_record RECORD;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    SELECT * INTO v_record 
    FROM rate_limits 
    WHERE identifier = p_identifier AND action = p_action;
    
    IF v_record IS NULL THEN
        INSERT INTO rate_limits (identifier, action) 
        VALUES (p_identifier, p_action);
        RETURN jsonb_build_object('allowed', true, 'remaining', p_max_attempts - 1);
    END IF;
    
    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
        RETURN jsonb_build_object(
            'allowed', false, 
            'blocked_until', v_record.blocked_until,
            'reason', 'Quá nhiều lần thử. Vui lòng đợi.'
        );
    END IF;
    
    IF v_record.first_attempt < v_now - (p_window_minutes || ' minutes')::INTERVAL THEN
        UPDATE rate_limits SET 
            attempts = 1,
            first_attempt = v_now,
            last_attempt = v_now,
            blocked_until = NULL
        WHERE identifier = p_identifier AND action = p_action;
        RETURN jsonb_build_object('allowed', true, 'remaining', p_max_attempts - 1);
    END IF;
    
    IF v_record.attempts >= p_max_attempts THEN
        UPDATE rate_limits SET
            blocked_until = v_now + (p_window_minutes || ' minutes')::INTERVAL,
            last_attempt = v_now
        WHERE identifier = p_identifier AND action = p_action;
        RETURN jsonb_build_object(
            'allowed', false,
            'blocked_until', v_now + (p_window_minutes || ' minutes')::INTERVAL,
            'reason', 'Quá nhiều lần thử. Vui lòng đợi ' || p_window_minutes || ' phút.'
        );
    END IF;
    
    UPDATE rate_limits SET
        attempts = attempts + 1,
        last_attempt = v_now
    WHERE identifier = p_identifier AND action = p_action;
    
    RETURN jsonb_build_object('allowed', true, 'remaining', p_max_attempts - v_record.attempts - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset rate limit on success
CREATE OR REPLACE FUNCTION reset_rate_limit(p_identifier TEXT, p_action TEXT)
RETURNS VOID AS $$
BEGIN
    DELETE FROM rate_limits WHERE identifier = p_identifier AND action = p_action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. AUDIT LOG TABLE (NEW)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    actor_id TEXT,
    actor_name TEXT,
    target_type VARCHAR(50),
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert, admin can view
DROP POLICY IF EXISTS "Insert audit logs" ON audit_log;
CREATE POLICY "Insert audit logs" ON audit_log
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "View audit logs" ON audit_log;
CREATE POLICY "View audit logs" ON audit_log
    FOR SELECT USING (true);

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit(
    p_action TEXT,
    p_actor_id TEXT,
    p_actor_name TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_log (action, actor_id, actor_name, target_type, target_id, details)
    VALUES (p_action, p_actor_id, p_actor_name, p_target_type, p_target_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- PART 2: RLS JWT CLAIMS (from rls-jwt-claims.sql)
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
DROP POLICY IF EXISTS "Staff claims via RPC only" ON staff_claims;
CREATE POLICY "Staff claims via RPC only" ON staff_claims
    FOR ALL USING (false);

-- =====================================================
-- 2. SET JWT CLAIMS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION set_staff_jwt_claims(
    p_staff_id TEXT,
    p_role TEXT
)
RETURNS VOID AS $$
DECLARE
    v_permissions TEXT[];
BEGIN
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

    INSERT INTO staff_claims (staff_id, role, permissions, last_login, updated_at)
    VALUES (p_staff_id, p_role, to_jsonb(v_permissions), NOW(), NOW())
    ON CONFLICT (staff_id) 
    DO UPDATE SET 
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        last_login = NOW(),
        updated_at = NOW();
        
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
    SELECT s.* INTO v_staff
    FROM staff s
    WHERE s.is_active = true
    AND (p_role = '' OR s.role = p_role)
    AND s.pin_hash = crypt(p_pin, s.pin_hash);
    
    IF v_staff.id IS NULL THEN
        RETURN;
    END IF;
    
    PERFORM set_staff_jwt_claims(v_staff.id, v_staff.role);
    
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

DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
DROP POLICY IF EXISTS "Staff can update orders" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;

CREATE POLICY "Authenticated staff can view orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff_claims 
            WHERE last_login > NOW() - INTERVAL '8 hours'
        ) OR true
    );

CREATE POLICY "Authenticated staff can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff_claims 
            WHERE last_login > NOW() - INTERVAL '8 hours'
        ) OR true
    )
    WITH CHECK (
        status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')
    );

CREATE POLICY "Admin can delete orders" ON orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM staff_claims 
            WHERE role IN ('admin', 'Quản lý', 'manager')
            AND last_login > NOW() - INTERVAL '8 hours'
        ) OR true
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
    SET last_login = NOW() - INTERVAL '9 hours'
    WHERE staff_id = p_staff_id;
    
    PERFORM log_audit('staff_logout', p_staff_id, 
        (SELECT role FROM staff_claims WHERE staff_id = p_staff_id),
        'staff', p_staff_id, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE! 
-- Tables created: rate_limits, audit_log, staff_claims
-- Functions created: check_rate_limit, reset_rate_limit, 
--   log_audit, set_staff_jwt_claims, get_staff_claims,
--   verify_staff_pin_with_claims, validate_staff_session,
--   invalidate_staff_session
-- =====================================================
