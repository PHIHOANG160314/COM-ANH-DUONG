-- =====================================================
-- TEMPORARY FIX: Allow all operations on articles
-- This bypasses authentication requirement
-- TODO: Implement proper Supabase auth for admin later
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON articles;
DROP POLICY IF EXISTS "Allow staff to modify" ON articles;

-- Public can read active articles
CREATE POLICY "Allow public read access" ON articles
    FOR SELECT 
    USING (is_active = true);

-- TEMPORARY: Allow all operations (no auth check)
-- Remove "TO authenticated" and use simple USING (true)
CREATE POLICY "Allow staff to modify" ON articles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verify
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'articles';
