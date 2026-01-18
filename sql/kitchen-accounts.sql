-- =====================================================
-- KITCHEN ACCOUNTS SCHEMA
-- Separate PIN authentication for kitchen staff
-- =====================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Kitchen accounts table
CREATE TABLE IF NOT EXISTS kitchen_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_kitchen_accounts_active ON kitchen_accounts(is_active);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Verify kitchen PIN
CREATE OR REPLACE FUNCTION verify_kitchen_pin(p_name VARCHAR, p_pin VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_account kitchen_accounts%ROWTYPE;
BEGIN
    -- Find account by name (case insensitive)
    SELECT * INTO v_account
    FROM kitchen_accounts
    WHERE LOWER(name) = LOWER(p_name)
    AND is_active = true;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Tài khoản không tồn tại hoặc đã bị khóa');
    END IF;

    -- Verify PIN
    IF v_account.pin_hash = crypt(p_pin, v_account.pin_hash) THEN
        -- Update last login
        UPDATE kitchen_accounts
        SET last_login_at = NOW()
        WHERE id = v_account.id;

        RETURN json_build_object(
            'success', true,
            'account', json_build_object(
                'id', v_account.id,
                'name', v_account.name
            )
        );
    ELSE
        RETURN json_build_object('success', false, 'error', 'Mã PIN không đúng');
    END IF;
END;
$$;

-- Admin create kitchen account
CREATE OR REPLACE FUNCTION admin_create_kitchen_account(p_name VARCHAR, p_pin VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_id UUID;
BEGIN
    -- Validate PIN format
    IF p_pin IS NULL OR LENGTH(p_pin) != 4 OR p_pin !~ '^\d{4}$' THEN
        RETURN json_build_object('success', false, 'error', 'PIN phải là 4 chữ số');
    END IF;

    -- Check duplicate name
    IF EXISTS (SELECT 1 FROM kitchen_accounts WHERE LOWER(name) = LOWER(p_name)) THEN
        RETURN json_build_object('success', false, 'error', 'Tên tài khoản đã tồn tại');
    END IF;

    -- Create account
    INSERT INTO kitchen_accounts (name, pin_hash)
    VALUES (p_name, crypt(p_pin, gen_salt('bf')))
    RETURNING id INTO v_new_id;

    RETURN json_build_object('success', true, 'id', v_new_id);
END;
$$;

-- Admin reset kitchen PIN
CREATE OR REPLACE FUNCTION admin_reset_kitchen_pin(p_account_id UUID, p_new_pin VARCHAR)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate PIN
    IF p_new_pin IS NULL OR LENGTH(p_new_pin) != 4 OR p_new_pin !~ '^\d{4}$' THEN
        RETURN json_build_object('success', false, 'error', 'PIN phải là 4 chữ số');
    END IF;

    -- Update PIN
    UPDATE kitchen_accounts
    SET pin_hash = crypt(p_new_pin, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_account_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Tài khoản không tồn tại');
    END IF;

    RETURN json_build_object('success', true);
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE kitchen_accounts ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users
CREATE POLICY "Allow read kitchen_accounts"
    ON kitchen_accounts FOR SELECT
    TO authenticated, anon
    USING (true);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default kitchen account (PIN: 1234)
INSERT INTO kitchen_accounts (name, pin_hash)
VALUES ('Bếp Chính', crypt('1234', gen_salt('bf')))
ON CONFLICT DO NOTHING;
