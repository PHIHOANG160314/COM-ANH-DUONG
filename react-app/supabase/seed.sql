-- =====================================================
-- SEED DATA - ÁNH DƯƠNG F&B
-- Created: 2026-01-31
-- =====================================================

-- Clean up existing data (optional, be careful in prod)
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.delivery_assignments CASCADE;
TRUNCATE TABLE public.menu_items CASCADE;
TRUNCATE TABLE public.categories CASCADE;
TRUNCATE TABLE public.staff CASCADE;
TRUNCATE TABLE public.shippers CASCADE;
-- TRUNCATE TABLE public.profiles CASCADE; -- Linked to auth.users, handled carefully below

-- =====================================================
-- 1. CATEGORIES
-- =====================================================
INSERT INTO public.categories (id, name, icon, sort_order) VALUES
('pho', 'Phở & Bún', '🍜', 1),
('com', 'Cơm Văn Phòng', '🍚', 2),
('banh-mi', 'Bánh Mì', 'baguette', 3),
('mon-an-kem', 'Món Ăn Kèm', 'food', 4),
('drinks', 'Đồ Uống', 'cup', 5),
('dessert', 'Tráng Miệng', 'icecream', 6);

-- =====================================================
-- 2. MENU ITEMS
-- =====================================================
-- Phở & Bún
INSERT INTO public.menu_items (name, price, category_id, description, image_url, is_featured) VALUES
('Phở Bò Tái', 55000, 'pho', 'Phở bò tái mềm ngọt, nước dùng ninh xương 24h', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Phở Bò Chín', 55000, 'pho', 'Phở bò nạm chín mềm, thơm ngon', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Phở Gà Ta', 50000, 'pho', 'Phở gà ta da giòn, thịt dai ngọt', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Bún Bò Huế', 60000, 'pho', 'Bún bò Huế đậm đà, chuẩn vị Cố Đô', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Bún Chả Hà Nội', 65000, 'pho', 'Bún chả nướng than hoa thơm lừng', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Bún Riêu Cua', 55000, 'pho', 'Bún riêu cua đồng, gạch cua béo ngậy', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Miến Gà', 50000, 'pho', 'Miến dong dai ngon, thịt gà ta xé phay', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false);

-- Cơm
INSERT INTO public.menu_items (name, price, category_id, description, image_url, is_featured) VALUES
('Cơm Tấm Sườn Bì Chả', 65000, 'com', 'Cơm tấm sườn nướng mật ong, bì chả trứng', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Cơm Gà Xối Mỡ', 60000, 'com', 'Cơm chiên giòn, đùi gà góc tư chiên mắm', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Cơm Rang Dưa Bò', 55000, 'com', 'Cơm rang giòn hạt, dưa chua bò mềm', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Cơm Thịt Kho Trứng', 50000, 'com', 'Cơm trắng, thịt kho tàu mềm rục, trứng kho', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Cơm Cá Kho Tộ', 55000, 'com', 'Cơm trắng, cá lóc kho tộ đậm đà', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Cơm Sườn Xào Chua Ngọt', 60000, 'com', 'Sườn non xào chua ngọt, cơm trắng dẻo', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false);

-- Bánh Mì
INSERT INTO public.menu_items (name, price, category_id, description, image_url, is_featured) VALUES
('Bánh Mì Đặc Biệt', 35000, 'banh-mi', 'Full topping: chả, thịt nguội, pate, bơ', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Bánh Mì Ốp La', 25000, 'banh-mi', '2 trứng ốp la, pate, xì dầu', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Bánh Mì Xíu Mại', 30000, 'banh-mi', 'Xíu mại sốt cà chua đậm đà', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Bánh Mì Heo Quay', 35000, 'banh-mi', 'Heo quay da giòn, nước sốt đậm đà', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Bánh Mì Chảo', 55000, 'banh-mi', 'Pate, trứng, xúc xích, khoai tây, sốt tiêu đen', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true);

-- Drinks
INSERT INTO public.menu_items (name, price, category_id, description, image_url, is_featured) VALUES
('Cà Phê Sữa Đá', 25000, 'drinks', 'Cà phê Robusta đậm đặc, sữa đặc Ngôi Sao', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Cà Phê Đen Đá', 20000, 'drinks', 'Cà phê đen nguyên chất', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Bạc Xỉu', 28000, 'drinks', 'Nhiều sữa, ít cà phê, béo ngậy', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Trà Đào Cam Sả', 45000, 'drinks', 'Trà đào thanh mát, có miếng đào giòn', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Trà Tắc Mật Ong', 30000, 'drinks', 'Giải nhiệt, chua ngọt hài hòa', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Sinh Tố Bơ', 45000, 'drinks', 'Bơ sáp dẻo quánh, sữa đặc', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Nước Ép Dưa Hấu', 35000, 'drinks', 'Nguyên chất, không đường', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false);

-- Desserts
INSERT INTO public.menu_items (name, price, category_id, description, image_url, is_featured) VALUES
('Chè Khúc Bạch', 35000, 'dessert', 'Khúc bạch phô mai, hạnh nhân, nhãn', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', true),
('Sữa Chua Nếp Cẩm', 25000, 'dessert', 'Sữa chua nhà làm, nếp cẩm dẻo thơm', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false),
('Flan Caramel', 15000, 'dessert', 'Bánh flan mềm mịn, caramen thơm đắng', 'https://images.unsplash.com/photo-1582878826618-c05326eff935?auto=format&fit=crop&w=800&q=80', false);

-- =====================================================
-- 3. STAFF (PIN Auth)
-- =====================================================
-- PINs are hashed with bcrypt.
-- '123456' -> $2a$10$3euPcmQFCiblsZeEu5s7p.9/1M.QvJ/w.3/1M.QvJ/w.3/1M.QvJ/w (Example hash, using gen_salt in script)

INSERT INTO public.staff (name, role, pin, phone, is_active) VALUES
('Nguyễn Văn Quản Lý', 'manager', crypt('123456', gen_salt('bf')), '0901234567', true),
('Trần Thị Thu Ngân', 'cashier', crypt('123456', gen_salt('bf')), '0901234568', true),
('Lê Văn Phục Vụ', 'waiter', crypt('123456', gen_salt('bf')), '0901234569', true),
('Phạm Thị Bếp', 'chef', crypt('123456', gen_salt('bf')), '0901234570', true),
('Admin Hệ Thống', 'admin', crypt('888888', gen_salt('bf')), '0909999999', true);

-- =====================================================
-- 4. SHIPPERS
-- =====================================================
INSERT INTO public.shippers (name, phone, pin, status, current_location) VALUES
('Nguyễn Văn Giao', '0912345678', crypt('123456', gen_salt('bf')), 'online', '{"lat": 10.762622, "lng": 106.660172}'),
('Trần Văn Tốc', '0912345679', crypt('123456', gen_salt('bf')), 'busy', '{"lat": 10.772622, "lng": 106.670172}'),
('Lê Văn Nhanh', '0912345680', crypt('123456', gen_salt('bf')), 'offline', '{"lat": 10.782622, "lng": 106.680172}');

-- =====================================================
-- 5. AUTH USERS & PROFILES (Mock Data)
-- =====================================================
-- Note: In a real Supabase environment, you cannot easily INSERT into auth.users via SQL
-- because of internal triggers and password hashing requirements.
-- However, for the purpose of Foreign Key relationships, we need IDs.
-- We will assume the TypeScript seeder will create actual auth users.
-- Here we can create some "placeholder" profiles if we want, OR just rely on the TS script.

-- For now, we will SKIP inserting into auth.users/profiles here to avoid conflicts.
-- The TypeScript script will handle Auth User creation + Profile creation.

-- =====================================================
-- 6. ORDERS (Sample Data)
-- =====================================================
-- We will create some orders using temporary customer IDs if possible,
-- or we need to insert some "Guest" customers first.

INSERT INTO public.customers (name, phone, email, total_spent, visits) VALUES
('Khách Vãng Lai 1', '0987654321', 'guest1@example.com', 500000, 5),
('Khách Vãng Lai 2', '0987654322', 'guest2@example.com', 1200000, 10),
('Nguyễn Thị Thân Thiết', '0987654323', 'vip@example.com', 5000000, 50);

-- Insert Orders
WITH cust AS (SELECT id FROM public.customers WHERE phone = '0987654321' LIMIT 1),
     staff_user AS (SELECT id FROM public.staff WHERE role = 'cashier' LIMIT 1)
INSERT INTO public.orders (order_number, customer_id, customer_name, customer_phone, status, order_type, payment_status, payment_method, table_number, subtotal, total, created_by)
VALUES
('AD240131-0001', (SELECT id FROM cust), 'Khách Vãng Lai 1', '0987654321', 'completed', 'dinein', 'paid', 'cash', '01', 110000, 110000, (SELECT id FROM staff_user)),
('AD240131-0002', (SELECT id FROM cust), 'Khách Vãng Lai 1', '0987654321', 'processing', 'dinein', 'pending', 'cash', '02', 55000, 55000, (SELECT id FROM staff_user));

-- Insert Order Items for Order 0001
WITH ord AS (SELECT id FROM public.orders WHERE order_number = 'AD240131-0001' LIMIT 1),
     item1 AS (SELECT id, name, price FROM public.menu_items WHERE name = 'Phở Bò Tái' LIMIT 1),
     item2 AS (SELECT id, name, price FROM public.menu_items WHERE name = 'Phở Bò Chín' LIMIT 1)
INSERT INTO public.order_items (order_id, menu_item_id, item_name, unit_price, quantity, total_price)
VALUES
((SELECT id FROM ord), (SELECT id FROM item1), (SELECT name FROM item1), (SELECT price FROM item1), 1, (SELECT price FROM item1)),
((SELECT id FROM ord), (SELECT id FROM item2), (SELECT name FROM item2), (SELECT price FROM item2), 1, (SELECT price FROM item2));

-- Insert Order Items for Order 0002
WITH ord AS (SELECT id FROM public.orders WHERE order_number = 'AD240131-0002' LIMIT 1),
     item1 AS (SELECT id, name, price FROM public.menu_items WHERE name = 'Cơm Tấm Sườn Bì Chả' LIMIT 1)
INSERT INTO public.order_items (order_id, menu_item_id, item_name, unit_price, quantity, total_price)
VALUES
((SELECT id FROM ord), (SELECT id FROM item1), (SELECT name FROM item1), (SELECT price FROM item1), 1, (SELECT price FROM item1));

-- Update configurations
INSERT INTO public.daily_menu_config (active_date, active_items)
SELECT CURRENT_DATE, array_agg(id) FROM public.menu_items WHERE is_featured = true;
