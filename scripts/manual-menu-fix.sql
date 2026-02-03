-- COMPLETE MENU FIX SQL
-- Run this in Supabase SQL Editor
-- This bypasses RLS restrictions

-- Step 1: Delete the 12 extra items
DELETE FROM menu_items WHERE id IN (
  97,   -- Sườn + trứng chiên (duplicate with wrong name)
  107,  -- Cá cơm kho lạt (xoài bằm) (duplicate with wrong name)
  113,  -- Cá he kho mềm xương (duplicate with wrong name)
  132,  -- Tép gạo ram mặn (duplicate with wrong name)
  149,  -- Combo Sáng Vui Vẻ
  150,  -- Combo Trưa Năng Lượng
  151,  -- Combo Đôi Bạn
  152,  -- Combo Gia Đình
  153,  -- Combo Cà Phê Sáng
  154,  -- Combo Sinh Tố Khỏe
  155,  -- Combo Bún Bò Party
  156   -- Combo Tráng Miệng
);

-- Step 2: Insert the 4 missing items with correct names
INSERT INTO menu_items (name, price, category_id, is_available)
VALUES
  ('Sườn + trứng - chiên', 30000, 'rice', true),
  ('Cá cơm - mồm kho lạt (xoài bằm)', 30000, 'rice', true),
  ('Cá he kho - mềm xương', 45000, 'rice', true),  -- Correct price: 45k
  ('Tép gạo ram mặm', 35000, 'rice', true);

-- Step 3: Verify count
SELECT COUNT(*) as total_food_items
FROM menu_items
WHERE id >= 91;
-- Should return: 58

-- Step 4: Verify the critical 450k item
SELECT id, name, price
FROM menu_items
WHERE name = 'Cá he kho - mềm xương';
-- Expected: price = 45000 (NOT 450000)
