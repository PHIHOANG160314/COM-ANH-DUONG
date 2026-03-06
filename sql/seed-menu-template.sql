-- ==========================================
-- SEED MENU - Cơm Ánh Dương
-- Xóa dữ liệu cũ và nhập theo mẫu mới
-- ==========================================

-- 1. Xóa categories cũ (trừ parent categories cần giữ)
DELETE FROM daily_menus;
DELETE FROM menu_items;
DELETE FROM categories;

-- 2. Tạo categories mới theo mẫu
INSERT INTO categories (id, name, icon, parent_id, "order", is_active) VALUES
  ('cat-com',      'Cơm',        '🍚', NULL, 1, true),
  ('cat-thit',     'Thịt',       '🥩', NULL, 2, true),
  ('cat-ca',       'Cá',         '🐟', NULL, 3, true),
  ('cat-canh',     'Canh',       '🍲', NULL, 4, true),
  ('cat-vitga',    'Vịt + Gà',   '🍗', NULL, 5, true),
  ('cat-khac',     'Khác',       '🍳', NULL, 6, true),
  ('cat-chay',     'Chay',       '🥬', NULL, 7, true),
  ('cat-xao',      'Xào',        '🥘', NULL, 8, true),
  ('cat-douong',   'Đồ Uống',    '🥤', NULL, 9, true),
  ('cat-trangmieng','Tráng Miệng','🍰', NULL, 10, true);

-- 3. Nhập menu items theo mẫu
INSERT INTO menu_items (name, price, category_id, is_active, is_sold_out, stock_quantity, description) VALUES
  -- === THỊT ===
  ('Sườn non ram mặn',           30000, 'cat-thit', true, false, 100, ''),
  ('Sườn muối sả chiên',         30000, 'cat-thit', true, false, 100, ''),
  ('Ba rọi chiên nước mắm',      35000, 'cat-thit', true, false, 100, ''),
  ('Thịt kho trứng',             30000, 'cat-thit', true, false, 100, ''),
  ('Thịt kho tiêu',              30000, 'cat-thit', true, false, 100, ''),
  ('Thịt xào mầm ruốc',          30000, 'cat-thit', true, false, 100, ''),
  ('Sườn + trứng chiên',         30000, 'cat-thit', true, false, 100, ''),
  ('Sườn chiên',                  30000, 'cat-thit', true, false, 100, ''),
  ('Sườn nướng',                  30000, 'cat-thit', true, false, 100, ''),

  -- === CÁ ===
  ('Cá sặt kho',                 30000, 'cat-ca', true, false, 100, ''),
  ('Cá ngừ kho khóm',            30000, 'cat-ca', true, false, 100, ''),
  ('Cá bạc má muối chiên',       30000, 'cat-ca', true, false, 100, ''),
  ('Cá nục kho cà',              30000, 'cat-ca', true, false, 100, ''),
  ('Cá mực chiên sốt cà chua',   30000, 'cat-ca', true, false, 100, ''),
  ('Cá tra kho',                 30000, 'cat-ca', true, false, 100, ''),
  ('Cá tra muối chiên',          30000, 'cat-ca', true, false, 100, ''),
  ('Cá cơm - mồm kho lạt (xoài bầm)', 30000, 'cat-ca', true, false, 100, ''),
  ('Cá điêu hồng chiên (mắm xoài)',    30000, 'cat-ca', true, false, 100, ''),
  ('Cá lưỡi trâu muối chiên',    35000, 'cat-ca', true, false, 100, ''),
  ('Cá điêu hồng chiên sốt tương', 30000, 'cat-ca', true, false, 100, ''),
  ('Khô cá dứa chiên',           30000, 'cat-ca', true, false, 100, ''),
  ('Cá he kho lạt',              35000, 'cat-ca', true, false, 100, ''),
  ('Cá he kho - mắm nướng',      45000, 'cat-ca', true, false, 100, ''),
  ('Cá cơm chiên bột',           30000, 'cat-ca', true, false, 100, ''),
  ('Cá lăn kho tiêu',            30000, 'cat-ca', true, false, 100, ''),
  ('Cá trê chiên (mắm gừng)',    30000, 'cat-ca', true, false, 100, ''),
  ('Cá trê kho tiêu',            30000, 'cat-ca', true, false, 100, ''),
  ('Cá rô kho',                  30000, 'cat-ca', true, false, 100, ''),
  ('Cá rô kho đậu',             30000, 'cat-ca', true, false, 100, ''),
  ('Cá kìa kho',                 30000, 'cat-ca', true, false, 100, ''),
  ('Cá kìa muối chiên',          30000, 'cat-ca', true, false, 100, ''),

  -- === CANH ===
  ('Canh chua cá tra',           30000, 'cat-canh', true, false, 100, ''),
  ('Canh chua cá lóc',           30000, 'cat-canh', true, false, 100, ''),
  ('Canh chua đầu cá lóc',       45000, 'cat-canh', true, false, 100, ''),
  ('Canh khổ qua',               30000, 'cat-canh', true, false, 100, ''),
  ('Canh chua cá điêu hồng',     30000, 'cat-canh', true, false, 100, ''),
  ('Canh gà lá giang',           30000, 'cat-canh', true, false, 100, ''),

  -- === VỊT + GÀ ===
  ('Vịt xào gừng',               30000, 'cat-vitga', true, false, 100, ''),
  ('Gà xào sả ớt',               30000, 'cat-vitga', true, false, 100, ''),
  ('Đùi gà chiên nước mắm',     30000, 'cat-vitga', true, false, 100, ''),

  -- === KHÁC ===
  ('Trứng chiên hành',           30000, 'cat-khac', true, false, 100, ''),
  ('Tép gạo ram mặn',            35000, 'cat-khac', true, false, 100, ''),
  ('Hến xào sả ớt',              30000, 'cat-khac', true, false, 100, ''),
  ('Hến xào cuộn trứng',         30000, 'cat-khac', true, false, 100, ''),
  ('Thịt bằm cuộn trứng',        30000, 'cat-khac', true, false, 100, ''),
  ('Lươn xào sả ớt',             30000, 'cat-khac', true, false, 100, ''),
  ('Ếch xào sả ớt',              30000, 'cat-khac', true, false, 100, ''),
  ('Ếch xào nghệ',               30000, 'cat-khac', true, false, 100, ''),

  -- === CHAY ===
  ('Sườn chay chiên giòn',       20000, 'cat-chay', true, false, 100, ''),
  ('Đậu hủ xào đậu que',         20000, 'cat-chay', true, false, 100, ''),
  ('Đậu hủ chiên sả',            20000, 'cat-chay', true, false, 100, ''),
  ('Đậu chiên giòn',             20000, 'cat-chay', true, false, 100, ''),
  ('Đậu hủ kho rau củ',          20000, 'cat-chay', true, false, 100, ''),
  ('Đậu hủ xào cải muối',        20000, 'cat-chay', true, false, 100, ''),

  -- === XÀO ===
  ('Khổ qua xào trứng',          30000, 'cat-xao', true, false, 100, ''),
  ('Dưa xào khổ qua',            35000, 'cat-xao', true, false, 100, ''),
  ('Bò xào bông cải',            35000, 'cat-xao', true, false, 100, ''),
  ('Bò xào đậu que',             35000, 'cat-xao', true, false, 100, '');

-- 4. Kiểm tra kết quả
SELECT c.name AS "Loại món", COUNT(m.id) AS "Số món"
FROM categories c
LEFT JOIN menu_items m ON m.category_id = c.id
GROUP BY c.name, c."order"
ORDER BY c."order";
