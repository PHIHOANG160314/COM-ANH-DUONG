-- =====================================================
-- RESET STAFF PIN FOR TESTING
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. EXTENSION REQUIRED (Usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. RESET ADMIN PIN TO '1234'
-- Updating the staff member named 'Admin'
UPDATE staff
SET 
    -- crypt('1234', gen_salt('bf')) creates a secure bcrypt hash of '1234'
    pin_hash = crypt('1234', gen_salt('bf')),
    updated_at = NOW()
WHERE name = 'Admin';

-- 3. VERIFY UPDATE
SELECT id, name, role, is_active 
FROM staff 
WHERE name = 'Admin';

NOTIFY pgrst, 'reload config';
