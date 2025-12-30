-- =====================================================
-- MENU ITEMS IMPORT - ÁNH DƯƠNG F&B
-- Run this in Supabase SQL Editor AFTER schema.sql
-- =====================================================

-- Clear existing menu items (optional, remove if you want to append)
-- TRUNCATE TABLE menu_items RESTART IDENTITY;

-- =====================================================
-- INSERT MENU ITEMS
-- =====================================================

INSERT INTO menu_items (id, name, price, category_id, subcategory_id, icon, cost, is_available) VALUES
-- ☕ CÀ PHÊ & GIẢI KHÁT (1-15)
(1, 'Cà Phê Đen Đá', 20000, 'drinks', 'coffee', '☕', 4000, true),
(2, 'Cà Phê Sữa Đá', 25000, 'drinks', 'coffee', '☕', 6000, true),
(3, 'Bạc Xỉu', 28000, 'drinks', 'coffee', '🥛', 7000, true),
(4, 'Cà Phê Muối', 35000, 'drinks', 'coffee', '🧂', 8000, true),
(5, 'Cà Phê Trứng', 40000, 'drinks', 'coffee', '🥚', 10000, true),
(6, 'Cacao Đá Xay', 35000, 'drinks', 'coffee', '🍫', 9000, true),
(7, 'Sữa Chua Đánh Đá', 25000, 'drinks', 'refresh', '🧊', 6000, true),
(8, 'Lipton Chanh Đá', 25000, 'drinks', 'refresh', '🍋', 5000, true),
(9, 'Nước Chanh Tươi', 20000, 'drinks', 'refresh', '🍋', 4000, true),
(10, 'Nước Chanh Dây', 25000, 'drinks', 'refresh', '🥤', 6000, true),
(11, 'Nước Cam Vắt', 35000, 'drinks', 'refresh', '🍊', 10000, true),
(12, 'Dừa Tươi', 25000, 'drinks', 'refresh', '🥥', 12000, true),
(13, 'Rau Má Đậu Xanh', 25000, 'drinks', 'refresh', '🌿', 6000, true),
(14, 'Nước Sâm', 15000, 'drinks', 'refresh', '🥤', 3000, true),
(15, 'Nước Mía', 12000, 'drinks', 'refresh', '🥤', 3000, true),

-- 🧋 TRÀ SỮA & TRÀ TRÁI CÂY (16-30)
(16, 'Trà Sữa Truyền Thống', 30000, 'drinks', 'milk-tea', '🧋', 8000, true),
(17, 'Trà Sữa Thái Xanh', 30000, 'drinks', 'milk-tea', '🧋', 8000, true),
(18, 'Trà Sữa Thái Đỏ', 30000, 'drinks', 'milk-tea', '🧋', 8000, true),
(19, 'Trà Sữa Matcha', 35000, 'drinks', 'milk-tea', '🍵', 10000, true),
(20, 'Trà Sữa Khoai Môn', 35000, 'drinks', 'milk-tea', '🍠', 9000, true),
(21, 'Sữa Tươi Trân Châu Đường Đen', 40000, 'drinks', 'milk-tea', '🥛', 12000, true),
(22, 'Trà Đào Cam Sả', 35000, 'drinks', 'fruit-tea', '🍑', 9000, true),
(23, 'Trà Vải Hoa Hồng', 35000, 'drinks', 'fruit-tea', '🌸', 9000, true),
(24, 'Trà Ổi Hồng', 35000, 'drinks', 'fruit-tea', '🍐', 9000, true),
(25, 'Trà Dâu Tằm', 35000, 'drinks', 'fruit-tea', '🍓', 9000, true),
(26, 'Trà Chanh Giã Tay', 30000, 'drinks', 'fruit-tea', '🍋', 7000, true),
(27, 'Trà Tắc Xí Muội', 25000, 'drinks', 'fruit-tea', '🍊', 6000, true),
(28, 'Trà Bí Đao Hạt Chia', 20000, 'drinks', 'fruit-tea', '🥒', 5000, true),
(29, 'Soda Blue Ocean', 35000, 'drinks', 'refresh', '🌊', 8000, true),
(30, 'Soda Chanh Dây', 35000, 'drinks', 'refresh', '🥤', 8000, true),

-- 🥑 SINH TỐ & ĐÁ XAY (36-45)
(36, 'Sinh Tố Bơ', 40000, 'drinks', 'smoothie', '🥑', 15000, true),
(37, 'Sinh Tố Xoài', 35000, 'drinks', 'smoothie', '🥭', 10000, true),
(38, 'Sinh Tố Dâu', 40000, 'drinks', 'smoothie', '🍓', 12000, true),
(39, 'Sinh Tố Mãng Cầu', 40000, 'drinks', 'smoothie', '🍈', 12000, true),
(40, 'Sinh Tố Sapoche', 35000, 'drinks', 'smoothie', '🥔', 10000, true),
(41, 'Sinh Tố Cà Chua', 30000, 'drinks', 'smoothie', '🍅', 8000, true),
(42, 'Matcha Đá Xay', 45000, 'drinks', 'smoothie', '🍵', 15000, true),
(43, 'Cookie Đá Xay', 45000, 'drinks', 'smoothie', '🍪', 14000, true),
(44, 'Sữa Chua Trái Cây', 35000, 'drinks', 'smoothie', '🥣', 10000, true),
(45, 'Kem Dừa Thái', 35000, 'dessert', 'sweet', '🥥', 12000, true),

-- 🍜 MÓN NƯỚC (51-65)
(51, 'Phở Bò Tái', 50000, 'food', 'noodle', '🍲', 18000, true),
(52, 'Phở Bò Nạm', 50000, 'food', 'noodle', '🍲', 18000, true),
(53, 'Phở Bò Đặc Biệt', 65000, 'food', 'noodle', '🍲', 25000, true),
(54, 'Phở Gà', 45000, 'food', 'noodle', '🐔', 16000, true),
(55, 'Bún Bò Huế', 55000, 'food', 'noodle', '🍜', 20000, true),
(56, 'Bún Bò Giò Heo', 60000, 'food', 'noodle', '🍜', 22000, true),
(57, 'Bún Riêu Cua', 45000, 'food', 'noodle', '🦀', 15000, true),
(58, 'Bún Mọc', 45000, 'food', 'noodle', '🥣', 15000, true),
(59, 'Bún Thịt Nướng', 45000, 'food', 'noodle', '🥗', 16000, true),
(60, 'Hủ Tiếu Nam Vang', 50000, 'food', 'noodle', '🥣', 18000, true),
(61, 'Hủ Tiếu Gõ', 30000, 'food', 'noodle', '🥢', 10000, true),
(62, 'Hủ Tiếu Bò Kho', 55000, 'food', 'noodle', '🥘', 20000, true),
(63, 'Mì Quảng', 50000, 'food', 'noodle', '🍜', 18000, true),
(64, 'Bánh Canh Cua', 60000, 'food', 'noodle', '🦀', 22000, true),
(65, 'Miến Gà', 45000, 'food', 'noodle', '🐔', 15000, true),

-- 🍚 CƠM & BÁNH MÌ (66-80)
(66, 'Cơm Sườn Nướng', 45000, 'food', 'rice', '🍚', 16000, true),
(67, 'Cơm Tấm Bì Chả', 45000, 'food', 'rice', '🍛', 15000, true),
(68, 'Cơm Tấm Sườn Bì Chả', 60000, 'food', 'rice', '🍛', 22000, true),
(69, 'Cơm Gà Xối Mỡ', 50000, 'food', 'rice', '🍗', 18000, true),
(70, 'Cơm Chiên Dương Châu', 50000, 'food', 'rice', '🍚', 15000, true),
(71, 'Cơm Chiên Hải Sản', 60000, 'food', 'rice', '🍤', 20000, true),
(72, 'Cơm Bò Lúc Lắc', 65000, 'food', 'rice', '🥩', 25000, true),
(73, 'Bánh Mì Thịt', 25000, 'food', 'bread', '🥖', 10000, true),
(74, 'Bánh Mì Ốp La', 20000, 'food', 'bread', '🍳', 8000, true),
(75, 'Bánh Mì Chảo', 45000, 'food', 'bread', '🥘', 16000, true),
(76, 'Bò Né + Ốp La', 60000, 'food', 'bread', '🥩', 25000, true),
(77, 'Mì Xào Bò', 50000, 'food', 'noodle', '🍝', 18000, true),
(78, 'Nui Xào Bò', 50000, 'food', 'noodle', '🍝', 18000, true),
(79, 'Cháo Lòng', 35000, 'food', 'noodle', '🥣', 12000, true),
(80, 'Súp Cua', 30000, 'food', 'noodle', '🥣', 10000, true),

-- 🍟 ĂN VẶT (81-89, 99-100)
(81, 'Khoai Tây Chiên', 30000, 'food', 'snack', '🍟', 8000, true),
(82, 'Cá Viên Chiên', 25000, 'food', 'snack', '🍡', 10000, true),
(83, 'Xúc Xích Nướng', 20000, 'food', 'snack', '🌭', 8000, true),
(84, 'Gà Rán (1 miếng)', 35000, 'food', 'snack', '🍗', 15000, true),
(85, 'Phô Mai Que', 35000, 'food', 'snack', '🧀', 12000, true),
(86, 'Nem Chua Rán', 40000, 'food', 'snack', '🥓', 14000, true),
(87, 'Bắp Xào Tép', 25000, 'food', 'snack', '🌽', 8000, true),
(88, 'Hột Vịt Lộn xao me', 20000, 'food', 'snack', '🥚', 6000, true),
(89, 'Bánh Tráng Trộn', 25000, 'food', 'snack', '🥡', 8000, true),
(99, 'Hạt Hướng Dương', 15000, 'food', 'snack', '🌻', 5000, true),
(100, 'Khô Gà Lá Chanh', 45000, 'food', 'snack', '🐔', 20000, true),

-- 🍧 TRÁNG MIỆNG (90-98)
(90, 'Chè Thái', 30000, 'dessert', 'che', '🍧', 10000, true),
(91, 'Chè Khúc Bạch', 35000, 'dessert', 'che', '🍮', 12000, true),
(92, 'Tàu Hũ Đá', 15000, 'dessert', 'che', '🥣', 4000, true),
(93, 'Sữa Chua Nếp Cẩm', 25000, 'dessert', 'che', '🥛', 8000, true),
(94, 'Kem Xôi Dừa', 35000, 'dessert', 'sweet', '🥥', 12000, true),
(95, 'Bánh Flan', 10000, 'dessert', 'sweet', '🍮', 3000, true),
(96, 'Rau Câu Dừa', 15000, 'dessert', 'sweet', '🥥', 5000, true),
(97, 'Trái Cây Tô', 40000, 'dessert', 'sweet', '🍉', 20000, true),
(98, 'Yaourt Đá', 20000, 'dessert', 'sweet', '🥤', 6000, true),

-- 🥘 MÓN NHÀ - CƠM PHẦN (101-120)
(101, 'Bò xào khổ qua', 35000, 'food', 'homemade', '🥩', 12000, true),
(102, 'Lươn xào sả ớt', 35000, 'food', 'homemade', '🐍', 12000, true),
(103, 'Sườn non ram mặn', 35000, 'food', 'homemade', '🍖', 12000, true),
(104, 'Ba rọi chiên nước mắm', 35000, 'food', 'homemade', '🥓', 12000, true),
(105, 'Sườn cốt lết chiên', 30000, 'food', 'homemade', '🥩', 10000, true),
(106, 'Thịt kho tiêu', 30000, 'food', 'homemade', '🥘', 10000, true),
(107, 'Thịt kho trứng', 30000, 'food', 'homemade', '🥚', 10000, true),
(108, 'Tép gạo ram mặn ngọt', 30000, 'food', 'homemade', '🦐', 10000, true),
(109, 'Đùi gà chiên nước mắm', 30000, 'food', 'homemade', '🍗', 10000, true),
(110, 'Ếch chiên nước mắm', 30000, 'food', 'homemade', '🐸', 10000, true),
(111, 'Vịt xào gừng', 30000, 'food', 'homemade', '🦆', 10000, true),
(112, 'Gà xào sả ớt', 30000, 'food', 'homemade', '🐔', 10000, true),
(113, 'Cá he kho lạt', 35000, 'food', 'homemade', '🐟', 12000, true),
(114, 'Cá sát kho tiêu', 30000, 'food', 'homemade', '🐟', 10000, true),
(115, 'Cá ngừ kho thơm', 30000, 'food', 'homemade', '🐟', 10000, true),
(116, 'Cá điêu hồng chiên', 30000, 'food', 'homemade', '🐟', 10000, true),
(117, 'Bụng cá basa chiên', 30000, 'food', 'homemade', '🐟', 10000, true),
(118, 'Canh chua cá tra', 30000, 'food', 'homemade', '🥣', 10000, true),
(119, 'Canh khổ qua dồn thịt', 30000, 'food', 'homemade', '🥣', 10000, true),
(120, 'Đậu hũ chiên sả (chay)', 20000, 'food', 'homemade', '🍛', 6000, true)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    icon = EXCLUDED.icon,
    cost = EXCLUDED.cost,
    is_available = EXCLUDED.is_available,
    updated_at = NOW();

-- =====================================================
-- SET FEATURED ITEMS
-- =====================================================
UPDATE menu_items SET is_featured = true WHERE id IN (1, 2, 16, 51, 66);

-- =====================================================
-- VERIFY IMPORT
-- =====================================================
SELECT 
    'Total menu items: ' || COUNT(*) as result
FROM menu_items;

SELECT 
    category_id,
    COUNT(*) as item_count
FROM menu_items
GROUP BY category_id
ORDER BY category_id;
