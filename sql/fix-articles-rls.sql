-- =====================================================
-- FIX: Articles RLS Policy (Complete Fix)
-- Drop all existing policies and recreate properly
-- =====================================================

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Allow public read access" ON articles;
DROP POLICY IF EXISTS "Allow staff to modify" ON articles;

-- 2. Recreate public read policy (unchanged)
CREATE POLICY "Allow public read access" ON articles
    FOR SELECT 
    USING (is_active = true);

-- 3. Create staff policy with both USING and WITH CHECK
CREATE POLICY "Allow staff to modify" ON articles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Verify policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'articles';
