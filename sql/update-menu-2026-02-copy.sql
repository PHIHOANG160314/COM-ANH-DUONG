-- =====================================================
-- CẬP NHẬT MENU MỚI - THÁNG 02/2026
-- Ngày tạo: 2026-02-01
-- Mô tả: Cập nhật menu món nhà theo danh sách mới
-- =====================================================

-- Thêm các subcategory mới nếu chưa có
INSERT INTO categories (id, name, icon, parent_id, "order") VALUES
('thit', 'Thịt', '🥩', 'food', 10),
('ca', 'Cá', '🐟', 'food', 11),
('canh', 'Canh', '🥣', 'food', 12),
('vit-ga', 'Vịt + Gà', '🍗', 'food', 13),
('xao', 'Xào', '🥘', 'food', 14),
('chay', 'Chay', '🥬', 'food', 15),
('khac', 'Khác', '🍽️', 'food', 16)
ON CONFLICT (id) DO NOTHING;

-- Xóa menu cũ trong subcategory homemade để thay thế
DELETE FROM menu_items WHERE subcategory_id = 'homemade';

-- Insert menu mới theo bảng giá
INSERT INTO menu_items (name, price, category_id, subcategory_id, icon, cost, is_available, is_featured)
VALUES
-- THỊT (35.000đ - 30.000đ)
('Sườn non ram mặn', 35000, 'food', 'thit', '🍖', 12000, true, false),
('Ba rọi chiên nước mắm', 35000, 'food', 'thit', '🥓', 12000, true, false),
('Thịt kho trứng', 30000, 'food', 'thit', '🥚', 10000, true, false),
('Thịt kho tiêu', 30000, 'food', 'thit', '🥘', 10000, true, false),
('Thịt xào mầm ruốc', 30000, 'food', 'thit', '🥩', 10000, true, false),
('Sườn + trứng chiên', 30000, 'food', 'thit', '🍳', 10000, true, false),
('Sườn chiên/nướng', 30000, 'food', 'thit', '🍖', 10000, true, false),

-- CÁ (30.000đ)
('Cá sát kho tiêu', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá ngừ kho khóm', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá bạc má muối chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá nục kho cà', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá nục chiên sốt cà chua', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá tra kho', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá tra muối chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá cơm (mỡm) kho lạt (xoài bằm)', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá điêu hồng chiên (mắm xoài)', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá lưỡi trâu muối chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá điêu hồng chiên sốt tương', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Khô cá dứa chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá he kho lạt', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá cơm chiên bột', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá lăn kho tiêu', 35000, 'food', 'ca', '🐟', 12000, true, false),
('Cá trê chiên (mắm gừng)', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá trê kho tiêu', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá rô kho', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá rô kho bầu', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá lóc kho', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá lóc muối chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),

-- CANH (30.000đ)
('Canh chua cá tra', 30000, 'food', 'canh', '🥣', 10000, true, false),
('Canh chua cá lóc', 30000, 'food', 'canh', '🥣', 10000, true, false),
('Canh khổ qua', 30000, 'food', 'canh', '🥣', 10000, true, false),
('Canh chua cá điêu hồng', 30000, 'food', 'canh', '🥣', 10000, true, false),
('Canh gà lá giang', 30000, 'food', 'canh', '🥣', 10000, true, false),

-- VỊT + GÀ (30.000đ - 45.000đ)
('Canh chua đầu cá lóc', 45000, 'food', 'vit-ga', '🥣', 15000, true, false),
('Vịt xào gừng', 30000, 'food', 'vit-ga', '🦆', 10000, true, false),
('Gà xào sả ớt', 30000, 'food', 'vit-ga', '🍗', 10000, true, false),
('Đùi gà chiên nước mắm', 30000, 'food', 'vit-ga', '🍗', 10000, true, false),

-- KHÁC (30.000đ)
('Trứng chiên hành', 30000, 'food', 'khac', '🍳', 10000, true, false),
('Tép gạo ram mặn', 35000, 'food', 'khac', '🦐', 12000, true, false),
('Hến xào cuốn trứng', 30000, 'food', 'khac', '🥚', 10000, true, false),
('Lươn xào sả ớt', 30000, 'food', 'khac', '🐍', 10000, true, false),
('Thịt bầm cuốn trứng', 30000, 'food', 'khac', '🥚', 10000, true, false),
('Ếch xào sả ớt', 30000, 'food', 'khac', '🐸', 10000, true, false),
('Ếch xào nghệ', 30000, 'food', 'khac', '🐸', 10000, true, false),
('Hến xào sả ớt', 30000, 'food', 'khac', '🐚', 10000, true, false),
('Sườn chay chiên giòn', 30000, 'food', 'khac', '🥬', 10000, true, false),

-- CHAY (20.000đ)
('Đậu hũ xào đậu que', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu hũ chiên sả', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu chiên giòn', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu hũ kho rau củ', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu hũ xào cải muối', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Khổ qua xào trứng', 30000, 'food', 'chay', '🥒', 10000, true, false),

-- XÀO (35.000đ)  
('Bò xào khổ qua', 35000, 'food', 'xao', '🥩', 12000, true, false),
('Bò xào bông cải', 35000, 'food', 'xao', '🥩', 12000, true, false),
('Bò xào đậu que', 35000, 'food', 'xao', '🥩', 12000, true, false);

-- Hiển thị kết quả
SELECT 
    subcategory_id as "Loại",
    COUNT(*) as "Số món",
    MIN(price) as "Giá thấp",
    MAX(price) as "Giá cao"
FROM menu_items 
WHERE subcategory_id IN ('thit', 'ca', 'canh', 'vit-ga', 'khac', 'chay', 'xao')
GROUP BY subcategory_id
ORDER BY subcategory_id;
