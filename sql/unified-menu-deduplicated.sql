-- =====================================================
-- UNIFIED MENU - DEDUPLICATED
-- Gộp data.js (108 items) + Excel (58 items) = 146 items
-- Loại bỏ 20 items trùng lặp
-- Ngày tạo: 2026-02-03
-- =====================================================

-- BƯỚC 1: XÓA TOÀN BỘ MENU CŨ
DELETE FROM menu_items;
SELECT setval('menu_items_id_seq', 1, false);

-- BƯỚC 2: THÊM PARENT CATEGORIES TRƯỚC
INSERT INTO categories (id, name, icon, parent_id, "order", is_active) VALUES
('drinks', 'Đồ Uống', '🥤', NULL, 1, true),
('food', 'Thức Ăn', '🍜', NULL, 2, true),
('dessert', 'Tráng Miệng', '🍰', NULL, 3, true),
('combo', 'Combo', '🎁', NULL, 4, true)
ON CONFLICT (id) DO UPDATE SET is_active = true;

-- BƯỚC 3: THÊM SUBCATEGORIES
INSERT INTO categories (id, name, icon, parent_id, "order", is_active) VALUES
('coffee', 'Cà Phê', '☕', 'drinks', 1, true),
('milk-tea', 'Trà Sữa', '🧋', 'drinks', 2, true),
('fruit-tea', 'Trà Trái Cây', '🍑', 'drinks', 3, true),
('smoothie', 'Sinh Tố', '🥤', 'drinks', 4, true),
('refresh', 'Giải Khát', '🧊', 'drinks', 5, true),
('noodle', 'Phở & Bún', '🍜', 'food', 1, true),
('rice', 'Cơm', '🍚', 'food', 2, true),
('bread', 'Bánh Mì', '🥖', 'food', 3, true),
('snack', 'Ăn Vặt', '🍟', 'food', 4, true),
('homemade', 'Món Nhà', '🥘', 'food', 5, true),
('che', 'Chè', '🍧', 'dessert', 1, true),
('sweet', 'Kem & Bánh', '🍮', 'dessert', 2, true),
('combo-lunch', 'Combo Trưa', '🍱', 'combo', 1, true),
('combo-drink', 'Combo Uống', '🥤', 'combo', 2, true),
('combo-family', 'Combo Gia Đình', '👨‍👩‍👧‍👦', 'combo', 3, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_active = true;

-- BƯỚC 3: INSERT TẤT CẢ MENU ITEMS
INSERT INTO menu_items (name, price, category_id, subcategory_id, icon, cost, is_available, is_featured)
VALUES

-- =====================================================
-- ☕ CÀ PHÊ & TRUYỀN THỐNG (15 items)
-- =====================================================
('Cà Phê Đen Đá', 20000, 'drinks', 'coffee', '☕', 4000, true, true),
('Cà Phê Sữa Đá', 25000, 'drinks', 'coffee', '☕', 6000, true, true),
('Bạc Xỉu', 28000, 'drinks', 'coffee', '🥛', 7000, true, false),
('Cà Phê Muối', 35000, 'drinks', 'coffee', '🧂', 8000, true, false),
('Cà Phê Trứng', 40000, 'drinks', 'coffee', '🥚', 10000, true, false),
('Cacao Đá Xay', 35000, 'drinks', 'coffee', '🍫', 9000, true, false),
('Sữa Chua Đánh Đá', 25000, 'drinks', 'refresh', '🧊', 6000, true, false),
('Lipton Chanh Đá', 25000, 'drinks', 'refresh', '🍋', 5000, true, false),
('Nước Chanh Tươi', 20000, 'drinks', 'refresh', '🍋', 4000, true, false),
('Nước Chanh Dây', 25000, 'drinks', 'refresh', '🥤', 6000, true, false),
('Nước Cam Vắt', 35000, 'drinks', 'refresh', '🍊', 10000, true, false),
('Dừa Tươi', 25000, 'drinks', 'refresh', '🥥', 12000, true, false),
('Rau Má Đậu Xanh', 25000, 'drinks', 'refresh', '🌿', 6000, true, false),
('Nước Sâm', 15000, 'drinks', 'refresh', '🥤', 3000, true, false),
('Nước Mía', 12000, 'drinks', 'refresh', '🥤', 3000, true, false),

-- =====================================================
-- 🧋 TRÀ SỮA & TRÀ TRÁI CÂY (15 items)
-- =====================================================
('Trà Sữa Truyền Thống', 30000, 'drinks', 'milk-tea', '🧋', 8000, true, true),
('Trà Sữa Thái Xanh', 30000, 'drinks', 'milk-tea', '🧋', 8000, true, false),
('Trà Sữa Thái Đỏ', 30000, 'drinks', 'milk-tea', '🧋', 8000, true, false),
('Trà Sữa Matcha', 35000, 'drinks', 'milk-tea', '🍵', 10000, true, false),
('Trà Sữa Khoai Môn', 35000, 'drinks', 'milk-tea', '🍠', 9000, true, false),
('Sữa Tươi Trân Châu Đường Đen', 40000, 'drinks', 'milk-tea', '🥛', 12000, true, false),
('Trà Đào Cam Sả', 35000, 'drinks', 'fruit-tea', '🍑', 9000, true, true),
('Trà Vải Hoa Hồng', 35000, 'drinks', 'fruit-tea', '🌸', 9000, true, false),
('Trà Ổi Hồng', 35000, 'drinks', 'fruit-tea', '🍐', 9000, true, false),
('Trà Dâu Tằm', 35000, 'drinks', 'fruit-tea', '🍓', 9000, true, false),
('Trà Chanh Giã Tay', 30000, 'drinks', 'fruit-tea', '🍋', 7000, true, false),
('Trà Tắc Xí Muội', 25000, 'drinks', 'fruit-tea', '🍊', 6000, true, false),
('Trà Bí Đao Hạt Chia', 20000, 'drinks', 'fruit-tea', '🥒', 5000, true, false),
('Soda Blue Ocean', 35000, 'drinks', 'refresh', '🌊', 8000, true, false),
('Soda Chanh Dây', 35000, 'drinks', 'refresh', '🥤', 8000, true, false),

-- =====================================================
-- 🥑 SINH TỐ & ĐÁ XAY (10 items)
-- =====================================================
('Sinh Tố Bơ', 40000, 'drinks', 'smoothie', '🥑', 15000, true, true),
('Sinh Tố Xoài', 35000, 'drinks', 'smoothie', '🥭', 10000, true, false),
('Sinh Tố Dâu', 40000, 'drinks', 'smoothie', '🍓', 12000, true, false),
('Sinh Tố Mãng Cầu', 40000, 'drinks', 'smoothie', '🍈', 12000, true, false),
('Sinh Tố Sapoche', 35000, 'drinks', 'smoothie', '🥔', 10000, true, false),
('Sinh Tố Cà Chua', 30000, 'drinks', 'smoothie', '🍅', 8000, true, false),
('Matcha Đá Xay', 45000, 'drinks', 'smoothie', '🍵', 15000, true, false),
('Cookie Đá Xay', 45000, 'drinks', 'smoothie', '🍪', 14000, true, false),
('Sữa Chua Trái Cây', 35000, 'drinks', 'smoothie', '🥣', 10000, true, false),
('Kem Dừa Thái', 35000, 'dessert', 'sweet', '🥥', 12000, true, false),

-- =====================================================
-- 🍜 MÓN NƯỚC - PHỞ & BÚN (15 items)
-- =====================================================
('Phở Bò Tái', 50000, 'food', 'noodle', '🍲', 18000, true, true),
('Phở Bò Nạm', 50000, 'food', 'noodle', '🍲', 18000, true, false),
('Phở Bò Đặc Biệt', 65000, 'food', 'noodle', '🍲', 25000, true, false),
('Phở Gà', 45000, 'food', 'noodle', '🐔', 16000, true, false),
('Bún Bò Huế', 55000, 'food', 'noodle', '🍜', 20000, true, true),
('Bún Bò Giò Heo', 60000, 'food', 'noodle', '🍜', 22000, true, false),
('Bún Riêu Cua', 45000, 'food', 'noodle', '🦀', 15000, true, false),
('Bún Mọc', 45000, 'food', 'noodle', '🥣', 15000, true, false),
('Bún Thịt Nướng', 45000, 'food', 'noodle', '🥗', 16000, true, false),
('Hủ Tiếu Nam Vang', 50000, 'food', 'noodle', '🥣', 18000, true, false),
('Hủ Tiếu Gõ', 30000, 'food', 'noodle', '🥢', 10000, true, false),
('Hủ Tiếu Bò Kho', 55000, 'food', 'noodle', '🥘', 20000, true, false),
('Mì Quảng', 50000, 'food', 'noodle', '🍜', 18000, true, false),
('Bánh Canh Cua', 60000, 'food', 'noodle', '🦀', 22000, true, false),
('Miến Gà', 45000, 'food', 'noodle', '🐔', 15000, true, false),

-- =====================================================
-- 🍚 CƠM & BÁNH MÌ (16 items)
-- =====================================================
('Cơm Sườn Nướng', 45000, 'food', 'rice', '🍚', 16000, true, true),
('Cơm Tấm Bì Chả', 45000, 'food', 'rice', '🍛', 15000, true, false),
('Cơm Tấm Sườn Bì Chả', 60000, 'food', 'rice', '🍛', 22000, true, false),
('Cơm Gà Xối Mỡ', 50000, 'food', 'rice', '🍗', 18000, true, false),
('Cơm Chiên Dương Châu', 50000, 'food', 'rice', '🍚', 15000, true, false),
('Cơm Chiên Hải Sản', 60000, 'food', 'rice', '🍤', 20000, true, false),
('Cơm Bò Lúc Lắc', 65000, 'food', 'rice', '🥩', 25000, true, false),
('Bánh Mì Thịt', 25000, 'food', 'bread', '🥖', 10000, true, false),
('Bánh Mì Ốp La', 20000, 'food', 'bread', '🍳', 8000, true, false),
('Bánh Mì Chảo', 45000, 'food', 'bread', '🥘', 16000, true, false),
('Bò Né + Ốp La', 60000, 'food', 'bread', '🥩', 25000, true, false),
('Mì Xào Bò', 50000, 'food', 'noodle', '🍝', 18000, true, false),
('Nui Xào Bò', 50000, 'food', 'noodle', '🍝', 18000, true, false),
('Cháo Lòng', 35000, 'food', 'noodle', '🥣', 12000, true, false),
('Súp Cua', 30000, 'food', 'noodle', '🥣', 10000, true, false),

-- =====================================================
-- 🍟 ĂN VẶT (11 items)
-- =====================================================
('Khoai Tây Chiên', 30000, 'food', 'snack', '🍟', 8000, true, false),
('Cá Viên Chiên', 25000, 'food', 'snack', '🍡', 10000, true, false),
('Xúc Xích Nướng', 20000, 'food', 'snack', '🌭', 8000, true, false),
('Gà Rán (1 miếng)', 35000, 'food', 'snack', '🍗', 15000, true, false),
('Phô Mai Que', 35000, 'food', 'snack', '🧀', 12000, true, false),
('Nem Chua Rán', 40000, 'food', 'snack', '🥓', 14000, true, false),
('Bắp Xào Tép', 25000, 'food', 'snack', '🌽', 8000, true, false),
('Hột Vịt Lộn xao me', 20000, 'food', 'snack', '🥚', 6000, true, false),
('Bánh Tráng Trộn', 25000, 'food', 'snack', '🥡', 8000, true, false),
('Hạt Hướng Dương', 15000, 'food', 'snack', '🌻', 5000, true, false),
('Khô Gà Lá Chanh', 45000, 'food', 'snack', '🐔', 20000, true, false),

-- =====================================================
-- 🍧 TRÁNG MIỆNG (9 items)
-- =====================================================
('Chè Thái', 30000, 'dessert', 'che', '🍧', 10000, true, false),
('Chè Khúc Bạch', 35000, 'dessert', 'che', '🍮', 12000, true, false),
('Tàu Hũ Đá', 15000, 'dessert', 'che', '🥣', 4000, true, false),
('Sữa Chua Nếp Cẩm', 25000, 'dessert', 'che', '🥛', 8000, true, false),
('Kem Xôi Dừa', 35000, 'dessert', 'sweet', '🥥', 12000, true, false),
('Bánh Flan', 10000, 'dessert', 'sweet', '🍮', 3000, true, false),
('Rau Câu Dừa', 15000, 'dessert', 'sweet', '🥥', 5000, true, false),
('Trái Cây Tô', 40000, 'dessert', 'sweet', '🍉', 20000, true, false),
('Yaourt Đá', 20000, 'dessert', 'sweet', '🥤', 6000, true, false),

-- =====================================================
-- 🥘 MÓN NHÀ - TỪ EXCEL (58 items) ⭐ PRIORITY
-- =====================================================
-- THỊT (9 món)
('Sườn non ram mặn', 35000, 'food', 'homemade', '🍖', 12000, true, false),
('Sườn muối sả chiên', 45000, 'food', 'homemade', '🍖', 15000, true, true),
('Ba rọi chiên nước mắm', 35000, 'food', 'homemade', '🥓', 12000, true, false),
('Thịt kho trứng', 30000, 'food', 'homemade', '🥚', 10000, true, true),
('Thịt kho tiêu', 30000, 'food', 'homemade', '🥘', 10000, true, false),
('Thịt xào mắm ruốc', 30000, 'food', 'homemade', '🥩', 10000, true, false),
('Sườn + trứng chiên', 30000, 'food', 'homemade', '🍳', 10000, true, false),
('Sườn chiên', 30000, 'food', 'homemade', '🍖', 10000, true, false),
('Sườn nướng', 30000, 'food', 'homemade', '🍖', 10000, true, false),

-- CÁ (22 món)
('Cá sát kho', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá ngừ kho khóm', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá bạc má muối chiên', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá nục kho cà', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá nục chiên sốt cà chua', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá tra kho', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá tra muối chiên', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá cơm kho lạt (xoài bằm)', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá điêu hồng chiên (mắm xoài)', 30000, 'food', 'homemade', '🐟', 10000, true, true),
('Cá lưỡi trâu muối chiên', 35000, 'food', 'homemade', '🐟', 12000, true, false),
('Cá điêu hồng chiên sốt tương', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Khô cá dứa chiên', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá he kho lạt', 35000, 'food', 'homemade', '🐟', 12000, true, false),
('Cá he kho mềm xương', 45000, 'food', 'homemade', '🐟', 15000, true, false),
('Cá cơm chiên bột', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá lăn kho tiêu', 35000, 'food', 'homemade', '🐟', 12000, true, false),
('Cá trê chiên (mắm gừng)', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá trê kho tiêu', 35000, 'food', 'homemade', '🐟', 12000, true, false),
('Cá rô kho', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá rô kho bầu', 30000, 'food', 'homemade', '🐟', 10000, true, false),
('Cá lóc kho', 30000, 'food', 'homemade', '🐟', 10000, true, true),
('Cá lóc muối chiên', 30000, 'food', 'homemade', '🐟', 10000, true, false),

-- CANH (6 món)
('Canh chua cá tra', 30000, 'food', 'homemade', '🥣', 10000, true, false),
('Canh chua cá lóc', 30000, 'food', 'homemade', '🥣', 10000, true, true),
('Canh chua đầu cá lóc', 45000, 'food', 'homemade', '🥣', 15000, true, false),
('Canh khổ qua', 30000, 'food', 'homemade', '🥣', 10000, true, false),
('Canh chua cá điêu hồng', 30000, 'food', 'homemade', '🥣', 10000, true, false),
('Canh gà lá giang', 30000, 'food', 'homemade', '🥣', 10000, true, false),

-- VỊT + GÀ (3 món)
('Vịt xào gừng', 30000, 'food', 'homemade', '🦆', 10000, true, true),
('Gà xào sả ớt', 30000, 'food', 'homemade', '🍗', 10000, true, false),
('Đùi gà chiên nước mắm', 30000, 'food', 'homemade', '🍗', 10000, true, false),

-- KHÁC (8 món)
('Trứng chiên hành', 30000, 'food', 'homemade', '🍳', 10000, true, false),
('Tép gạo ram mặn', 35000, 'food', 'homemade', '🦐', 12000, true, false),
('Hến xào sả ớt', 30000, 'food', 'homemade', '🐚', 10000, true, false),
('Hến xào cuộn trứng', 30000, 'food', 'homemade', '🥚', 10000, true, false),
('Thịt bằm cuộn trứng', 30000, 'food', 'homemade', '🥚', 10000, true, false),
('Lươn xào sả ớt', 30000, 'food', 'homemade', '🐍', 10000, true, false),
('Ếch xào sả ớt', 30000, 'food', 'homemade', '🐸', 10000, true, false),
('Ếch xào nghệ', 30000, 'food', 'homemade', '🐸', 10000, true, false),

-- CHAY (6 món)
('Sườn chay chiên giòn', 20000, 'food', 'homemade', '🥬', 6000, true, false),
('Đậu hủ xào đậu que', 20000, 'food', 'homemade', '🥬', 6000, true, false),
('Đậu hủ chiên sả', 20000, 'food', 'homemade', '🥬', 6000, true, false),
('Đậu chiên giòn', 20000, 'food', 'homemade', '🥬', 6000, true, false),
('Đậu hủ kho rau củ', 20000, 'food', 'homemade', '🥬', 6000, true, false),
('Đậu hủ xào cải muối', 20000, 'food', 'homemade', '🥬', 6000, true, false),

-- XÀO (4 món)
('Khổ qua xào trứng', 20000, 'food', 'homemade', '🥒', 6000, true, false),
('Bò xào khổ qua', 35000, 'food', 'homemade', '🥩', 12000, true, true),
('Bò xào bông cải', 35000, 'food', 'homemade', '🥩', 12000, true, false),
('Bò xào đậu que', 35000, 'food', 'homemade', '🥩', 12000, true, false),

-- =====================================================
-- 🎁 COMBO (8 items)
-- =====================================================
('Combo Sáng Vui Vẻ', 65000, 'combo', 'combo-lunch', '🌅', 30000, true, true),
('Combo Trưa Năng Lượng', 70000, 'combo', 'combo-lunch', '☀️', 35000, true, true),
('Combo Đôi Bạn', 75000, 'combo', 'combo-drink', '👫', 40000, true, false),
('Combo Gia Đình', 199000, 'combo', 'combo-family', '👨‍👩‍👧‍👦', 100000, true, true),
('Combo Cà Phê Sáng', 42000, 'combo', 'combo-lunch', '☕', 20000, true, false),
('Combo Sinh Tố Khỏe', 70000, 'combo', 'combo-drink', '🥑', 35000, true, false),
('Combo Bún Bò Party', 250000, 'combo', 'combo-family', '🎉', 120000, true, false),
('Combo Tráng Miệng', 35000, 'combo', 'combo-drink', '🍮', 15000, true, false);

-- =====================================================
-- THỐNG KÊ
-- =====================================================
SELECT 
    subcategory_id as "Loại",
    COUNT(*) as "Số món",
    MIN(price) as "Giá thấp",
    MAX(price) as "Giá cao"
FROM menu_items 
GROUP BY subcategory_id
ORDER BY COUNT(*) DESC;

-- TỔNG SỐ MÓN
SELECT 'TỔNG CỘNG' as "Loại", COUNT(*) as "Số món" FROM menu_items;
