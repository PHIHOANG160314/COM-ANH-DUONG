-- =====================================================
-- CẬP NHẬT MENU MỚI - TỪ FILE EXCEL "menu mau.xlsx"
-- Ngày tạo: 2026-02-02
-- Mô tả: Cập nhật menu món nhà theo danh sách mới
-- Tổng cộng: 58 món
-- =====================================================

-- Thêm các category mới nếu chưa có
INSERT INTO categories (id, name, icon, parent_id, "order") VALUES
('thit', 'Thịt', '🥩', 'food', 10),
('ca', 'Cá', '🐟', 'food', 11),
('canh', 'Canh', '🥣', 'food', 12),
('vit-ga', 'Vịt + Gà', '🍗', 'food', 13),
('khac', 'Khác', '🍽️', 'food', 14),
('chay', 'Chay', '🥬', 'food', 15),
('xao', 'Xào', '🥘', 'food', 16)
ON CONFLICT (id) DO NOTHING;

-- Xóa menu cũ trong subcategory cần cập nhật
DELETE FROM menu_items WHERE subcategory_id IN ('thit', 'ca', 'canh', 'vit-ga', 'khac', 'chay', 'xao');

-- Reset sequence để tránh lỗi
SELECT setval('menu_items_id_seq', (SELECT COALESCE(MAX(id), 0) FROM menu_items) + 1, false);

-- =====================================================
-- INSERT MENU ITEMS TỪ EXCEL
-- =====================================================

INSERT INTO menu_items (name, price, category_id, subcategory_id, icon, cost, is_available, is_featured)
VALUES
-- === THỊT (9 món) ===
('Sườn non ram mặn', 35000, 'food', 'thit', '🍖', 12000, true, false),
('Sườn muối sả chiên', 45000, 'food', 'thit', '🍖', 15000, true, true),
('Ba rọi chiên nước mắm', 35000, 'food', 'thit', '🥓', 12000, true, false),
('Thịt kho trứng', 30000, 'food', 'thit', '🥚', 10000, true, true),
('Thịt kho tiêu', 30000, 'food', 'thit', '🥘', 10000, true, false),
('Thịt xào mắm ruốc', 30000, 'food', 'thit', '🥩', 10000, true, false),
('Sườn + trứng chiên', 30000, 'food', 'thit', '🍳', 10000, true, false),
('Sườn chiên', 30000, 'food', 'thit', '🍖', 10000, true, false),
('Sườn nướng', 30000, 'food', 'thit', '🍖', 10000, true, false),

-- === CÁ (22 món) ===
('Cá sát kho', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá ngừ kho khóm', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá bạc má muối chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá nục kho cà', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá nục chiên sốt cà chua', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá tra kho', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá tra muối chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá cơm kho lạt (xoài bằm)', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá điêu hồng chiên (mắm xoài)', 30000, 'food', 'ca', '🐟', 10000, true, true),
('Cá lưỡi trâu muối chiên', 35000, 'food', 'ca', '🐟', 12000, true, false),
('Cá điêu hồng chiên sốt tương', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Khô cá dứa chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá he kho lạt', 35000, 'food', 'ca', '🐟', 12000, true, false),
('Cá he kho - mềm xương', 45000, 'food', 'ca', '🐟', 15000, true, false),
('Cá cơm chiên bột', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá lăn kho tiêu', 35000, 'food', 'ca', '🐟', 12000, true, false),
('Cá trê chiên (mắm gừng)', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá trê kho tiêu', 35000, 'food', 'ca', '🐟', 12000, true, false),
('Cá rô kho', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá rô kho bầu', 30000, 'food', 'ca', '🐟', 10000, true, false),
('Cá lóc kho', 30000, 'food', 'ca', '🐟', 10000, true, true),
('Cá lóc muối chiên', 30000, 'food', 'ca', '🐟', 10000, true, false),

-- === CANH (6 món) ===
('Canh chua cá tra', 30000, 'food', 'canh', '🥣', 10000, true, false),
('Canh chua cá lóc', 30000, 'food', 'canh', '🥣', 10000, true, true),
('Canh chua đầu cá lóc', 45000, 'food', 'canh', '🥣', 15000, true, false),
('Canh khổ qua', 30000, 'food', 'canh', '🥣', 10000, true, false),
('Canh chua cá điêu hồng', 30000, 'food', 'canh', '🥣', 10000, true, false),
('Canh gà lá giang', 30000, 'food', 'canh', '🥣', 10000, true, false),

-- === VỊT + GÀ (3 món) ===
('Vịt xào gừng', 30000, 'food', 'vit-ga', '🦆', 10000, true, true),
('Gà xào sả ớt', 30000, 'food', 'vit-ga', '🍗', 10000, true, false),
('Đùi gà chiên nước mắm', 30000, 'food', 'vit-ga', '🍗', 10000, true, false),

-- === KHÁC (8 món) ===
('Trứng chiên hành', 30000, 'food', 'khac', '🍳', 10000, true, false),
('Tép gạo ram mặn', 35000, 'food', 'khac', '🦐', 12000, true, false),
('Hến xào sả ớt', 30000, 'food', 'khac', '🐚', 10000, true, false),
('Hến xào cuộn trứng', 30000, 'food', 'khac', '🥚', 10000, true, false),
('Thịt bằm cuộn trứng', 30000, 'food', 'khac', '🥚', 10000, true, false),
('Lươn xào sả ớt', 30000, 'food', 'khac', '�', 10000, true, false),
('Ếch xào sả ớt', 30000, 'food', 'khac', '🐸', 10000, true, false),
('Ếch xào nghệ', 30000, 'food', 'khac', '�', 10000, true, false),

-- === CHAY (6 món) ===
('Sườn chay chiên giòn', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu hủ xào đậu que', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu hủ chiên sả', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu chiên giòn', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu hủ kho rau củ', 20000, 'food', 'chay', '🥬', 6000, true, false),
('Đậu hủ xào cải muối', 20000, 'food', 'chay', '🥬', 6000, true, false),

-- === XÀO (4 món) ===
('Khổ qua xào trứng', 20000, 'food', 'xao', '🥒', 6000, true, false),
('Bò xào khổ qua', 35000, 'food', 'xao', '🥩', 12000, true, true),
('Bò xào bông cải', 35000, 'food', 'xao', '🥩', 12000, true, false),
('Bò xào đậu que', 35000, 'food', 'xao', '🥩', 12000, true, false);

-- =====================================================
-- THỐNG KÊ KẾT QUẢ
-- =====================================================
SELECT 
    subcategory_id as "Loại",
    COUNT(*) as "Số món",
    MIN(price) as "Giá thấp",
    MAX(price) as "Giá cao"
FROM menu_items 
WHERE subcategory_id IN ('thit', 'ca', 'canh', 'vit-ga', 'khac', 'chay', 'xao')
GROUP BY subcategory_id
ORDER BY 
    CASE subcategory_id 
        WHEN 'thit' THEN 1 
        WHEN 'ca' THEN 2 
        WHEN 'canh' THEN 3 
        WHEN 'vit-ga' THEN 4 
        WHEN 'khac' THEN 5 
        WHEN 'chay' THEN 6 
        WHEN 'xao' THEN 7 
    END;
