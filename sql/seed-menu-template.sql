-- ==========================================
-- SEED MENU - Cơm Ánh Dương
-- Xóa dữ liệu cũ và nhập theo mẫu mới
-- ==========================================

-- 1. Xóa dữ liệu cũ
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

-- 3. Nhập menu items (chỉ dùng cột name, price, category_id)
INSERT INTO menu_items (name, price, category_id) VALUES
  -- === THỊT ===
  ('Sườn non ram mặn',           30000, 'cat-thit'),
  ('Sườn muối sả chiên',         30000, 'cat-thit'),
  ('Ba rọi chiên nước mắm',      35000, 'cat-thit'),
  ('Thịt kho trứng',             30000, 'cat-thit'),
  ('Thịt kho tiêu',              30000, 'cat-thit'),
  ('Thịt xào mầm ruốc',          30000, 'cat-thit'),
  ('Sườn + trứng chiên',         30000, 'cat-thit'),
  ('Sườn chiên',                  30000, 'cat-thit'),
  ('Sườn nướng',                  30000, 'cat-thit'),

  -- === CÁ ===
  ('Cá sặt kho',                 30000, 'cat-ca'),
  ('Cá ngừ kho khóm',            30000, 'cat-ca'),
  ('Cá bạc má muối chiên',       30000, 'cat-ca'),
  ('Cá nục kho cà',              30000, 'cat-ca'),
  ('Cá mực chiên sốt cà chua',   30000, 'cat-ca'),
  ('Cá tra kho',                 30000, 'cat-ca'),
  ('Cá tra muối chiên',          30000, 'cat-ca'),
  ('Cá cơm - mồm kho lạt (xoài bầm)', 30000, 'cat-ca'),
  ('Cá điêu hồng chiên (mắm xoài)',    30000, 'cat-ca'),
  ('Cá lưỡi trâu muối chiên',    35000, 'cat-ca'),
  ('Cá điêu hồng chiên sốt tương', 30000, 'cat-ca'),
  ('Khô cá dứa chiên',           30000, 'cat-ca'),
  ('Cá he kho lạt',              35000, 'cat-ca'),
  ('Cá he kho - mắm nướng',      45000, 'cat-ca'),
  ('Cá cơm chiên bột',           30000, 'cat-ca'),
  ('Cá lăn kho tiêu',            30000, 'cat-ca'),
  ('Cá trê chiên (mắm gừng)',    30000, 'cat-ca'),
  ('Cá trê kho tiêu',            30000, 'cat-ca'),
  ('Cá rô kho',                  30000, 'cat-ca'),
  ('Cá rô kho đậu',             30000, 'cat-ca'),
  ('Cá kìa kho',                 30000, 'cat-ca'),
  ('Cá kìa muối chiên',          30000, 'cat-ca'),

  -- === CANH ===
  ('Canh chua cá tra',           30000, 'cat-canh'),
  ('Canh chua cá lóc',           30000, 'cat-canh'),
  ('Canh chua đầu cá lóc',       45000, 'cat-canh'),
  ('Canh khổ qua',               30000, 'cat-canh'),
  ('Canh chua cá điêu hồng',     30000, 'cat-canh'),
  ('Canh gà lá giang',           30000, 'cat-canh'),

  -- === VỊT + GÀ ===
  ('Vịt xào gừng',               30000, 'cat-vitga'),
  ('Gà xào sả ớt',               30000, 'cat-vitga'),
  ('Đùi gà chiên nước mắm',     30000, 'cat-vitga'),

  -- === KHÁC ===
  ('Trứng chiên hành',           30000, 'cat-khac'),
  ('Tép gạo ram mặn',            35000, 'cat-khac'),
  ('Hến xào sả ớt',              30000, 'cat-khac'),
  ('Hến xào cuộn trứng',         30000, 'cat-khac'),
  ('Thịt bằm cuộn trứng',        30000, 'cat-khac'),
  ('Lươn xào sả ớt',             30000, 'cat-khac'),
  ('Ếch xào sả ớt',              30000, 'cat-khac'),
  ('Ếch xào nghệ',               30000, 'cat-khac'),

  -- === CHAY ===
  ('Sườn chay chiên giòn',       20000, 'cat-chay'),
  ('Đậu hủ xào đậu que',         20000, 'cat-chay'),
  ('Đậu hủ chiên sả',            20000, 'cat-chay'),
  ('Đậu chiên giòn',             20000, 'cat-chay'),
  ('Đậu hủ kho rau củ',          20000, 'cat-chay'),
  ('Đậu hủ xào cải muối',        20000, 'cat-chay'),

  -- === XÀO ===
  ('Khổ qua xào trứng',          30000, 'cat-xao'),
  ('Dưa xào khổ qua',            35000, 'cat-xao'),
  ('Bò xào bông cải',            35000, 'cat-xao'),
  ('Bò xào đậu que',             35000, 'cat-xao');

-- 4. Kiểm tra kết quả
SELECT c.name AS "Loại món", COUNT(m.id) AS "Số món"
FROM categories c
LEFT JOIN menu_items m ON m.category_id = c.id
GROUP BY c.name, c."order"
ORDER BY c."order";
