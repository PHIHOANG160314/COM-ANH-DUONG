-- =====================================================
-- SEED DATA - PRODUCTS TABLE
-- Cơm Ánh Dương F&B
-- =====================================================

-- Clear existing products (be careful in production!)
-- TRUNCATE TABLE public.products CASCADE;

-- =====================================================
-- INSERT PRODUCTS
-- Matching the demo data from use-menu.ts
-- =====================================================

-- Cơm Phần Category
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Cơm Sườn Nướng', 'Sườn heo nướng than hồng, ăn kèm dưa leo, cà chua', 45000, '/images/menu/com_suon_nuong.png', 'com', true, false),
('Cơm Gà Xối Mỡ', 'Đùi gà chiên giòn, nước mắm tỏi ớt đặc biệt', 40000, '/images/menu/com_ga_xoi_mo.png', 'com', true, false),
('Cơm Tấm Bì Chả', 'Bì heo, chả trứng, mỡ hành, đồ chua', 35000, '/images/menu/com_tam_bi_cha.png', 'com', true, false),
('Cơm Thịt Kho Trứng', 'Cơm trắng, thịt kho tàu mềm rục, trứng kho', 38000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 'com', true, false),
('Cơm Cá Kho Tộ', 'Cơm trắng, cá lóc kho tộ đậm đà', 42000, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', 'com', true, false),
('Cơm Rang Dưa Bò', 'Cơm rang giòn hạt, dưa chua bò mềm', 45000, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', 'com', true, false);

-- Phở & Bún Category
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Phở Bò Tái', 'Phở bò tái mềm ngọt, nước dùng ninh xương 24h', 55000, '/images/menu/pho_bo_tai.png', 'pho', true, false),
('Phở Gà Ta', 'Phở gà ta da giòn, thịt dai ngọt', 50000, 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', 'pho', true, false),
('Bún Bò Huế', 'Bún bò Huế đậm đà, chuẩn vị Cố Đô', 60000, '/images/menu/bun_bo_hue.png', 'pho', true, false),
('Bún Chả Hà Nội', 'Bún chả nướng than hoa thơm lừng', 55000, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80', 'pho', true, false);

-- Bánh Mì Category
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Bánh Mì Đặc Biệt', 'Full topping: chả, thịt nguội, pate, bơ', 35000, '/images/menu/banh_mi_dac_biet.png', 'banh-mi', true, false),
('Bánh Mì Ốp La', '2 trứng ốp la, pate, xì dầu', 25000, 'https://images.unsplash.com/photo-1600628421060-939639517883?auto=format&fit=crop&w=800&q=80', 'banh-mi', true, false),
('Bánh Mì Chảo', 'Pate, trứng, xúc xích, khoai tây, sốt tiêu đen', 55000, 'https://images.unsplash.com/photo-1600628421060-939639517883?auto=format&fit=crop&w=800&q=80', 'banh-mi', true, false);

-- Drinks Category
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Cà Phê Sữa Đá', 'Cà phê Robusta đậm đặc, sữa đặc Ngôi Sao', 25000, '/images/menu/ca_phe_sua_da.png', 'drinks', true, false),
('Bạc Xỉu', 'Cà phê sữa ít đắng, nhiều sữa', 30000, '/images/menu/bac_xiu.png', 'drinks', true, false),
('Trà Đào Cam Sả', 'Trà đào thanh mát, có miếng đào giòn', 45000, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', 'drinks', true, false),
('Sinh Tố Bơ', 'Bơ sáp dẻo quánh, sữa đặc', 40000, 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80', 'drinks', true, false);

-- Dessert Category
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Chè Khúc Bạch', 'Khúc bạch phô mai, hạnh nhân, nhãn', 35000, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80', 'dessert', true, false),
('Sữa Chua Đánh Đá', 'Sữa chua đánh đá mát lạnh', 25000, '/images/menu/sua_chua_danh_da.png', 'dessert', true, false),
('Flan Caramel', 'Bánh flan mềm mịn, caramen thơm đắng', 15000, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80', 'dessert', true, false);

-- =====================================================
-- Verify seed data
-- =====================================================
-- Run this to check:
-- SELECT * FROM public.products ORDER BY category_id, name;
-- SELECT COUNT(*) FROM public.products; -- Should be ~18 items
