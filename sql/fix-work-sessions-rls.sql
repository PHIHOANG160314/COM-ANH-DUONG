-- Fix RLS cho work_sessions - cho phép anonymous read
-- Chạy trong Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read active work sessions" ON work_sessions;
DROP POLICY IF EXISTS "Authenticated users can create work sessions" ON work_sessions;
DROP POLICY IF EXISTS "Creator can update work sessions" ON work_sessions;

-- Allow anonymous and authenticated users to read
CREATE POLICY "Allow all to read active work sessions"
    ON work_sessions FOR SELECT
    TO anon, authenticated
    USING (is_active = true AND expires_at > NOW());

-- Allow all to insert
CREATE POLICY "Allow all to create work sessions"
    ON work_sessions FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow all to update
CREATE POLICY "Allow all to update work sessions"
    ON work_sessions FOR UPDATE
    TO anon, authenticated
    USING (true);

-- Verify: Check current sessions
SELECT code, created_by, expires_at, is_active FROM work_sessions ORDER BY created_at DESC LIMIT 5;
