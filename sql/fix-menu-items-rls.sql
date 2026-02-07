-- ==============================================================================
-- FIX QUYỀN TRUY CẬP (RLS) CHO MENU ITEMS
-- Chạy script này trong Supabase SQL Editor để đảm bảo Admin luôn thấy được món ăn
-- ==============================================================================

-- 1. Cho phép admin/staff (authenticated users) xem tất cả món ăn (kể cả món ẩn)
DROP POLICY IF EXISTS "Authenticated read all menu_items" ON menu_items;
CREATE POLICY "Authenticated read all menu_items" ON menu_items
    FOR SELECT TO authenticated USING (true);

-- 2. Đảm bảo khách vãng lai chỉ xem được món đang mở bán (is_available = true)
DROP POLICY IF EXISTS "Public read menu_items" ON menu_items;
CREATE POLICY "Public read menu_items" ON menu_items
    FOR SELECT USING (is_available = true);

-- 3. Kiểm tra lại policy hiện tại
SELECT * FROM pg_policies WHERE tablename = 'menu_items';
