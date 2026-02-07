-- =====================================================
-- SEED DATA - PRODUCTS TABLE
-- Quán Cơm Ánh Dương F&B
-- Updated: 2026-02-01 (from handwritten menu)
-- =====================================================

-- Clear existing products (be careful in production!)
-- TRUNCATE TABLE public.products CASCADE;

-- =====================================================
-- INSERT PRODUCTS - MÓN CHÍNH (20 món)
-- From handwritten menu dated 12/11/25
-- =====================================================

-- Món Thịt Heo
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Heo Quay Xào Dưa Cải', 'Heo quay giòn xào cùng dưa cải chua', 40000, '/images/menu/heo_quay_xao_dua_cai.png', 'com', true, false),
('Ba Sọi Chiên Nước Mắm', 'Ba sọi chiên giòn, nước mắm tỏi ớt', 35000, '/images/menu/ba_soi_chien_nuoc_mam.png', 'com', true, false),
('Sườn Cốt Lết Chiên', 'Sườn cốt lết chiên vàng giòn', 30000, '/images/menu/suon_cot_let_chien.png', 'com', true, false),
('Ruột Heo Khìa Nước Dừa', 'Ruột heo khìa nước dừa thơm béo', 30000, '/images/menu/ruot_heo_khia_nuoc_dua.png', 'com', true, false),
('Thịt Kho Tiêu', 'Thịt heo kho tiêu đậm đà', 30000, '/images/menu/thit_kho_tieu.png', 'com', true, false),
('Thịt Kho Trứng', 'Thịt heo kho tàu kèm trứng', 30000, '/images/menu/thit_kho_trung.png', 'com', true, false);

-- Món Bò
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Bò Xào Đậu Hòng', 'Bò xào đậu hòng giòn ngọt', 35000, '/images/menu/bo_xao_dau_hong.png', 'com', true, false);

-- Món Hải Sản
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Tép Gạo Ram Mặn Ngọt', 'Tép gạo ram mặn ngọt giòn rụm', 30000, '/images/menu/tep_gao_ram_man_ngot.png', 'com', true, false);

-- Món Gà & Vịt
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Đùi Gà Chiên Nước Mắm', 'Đùi gà chiên giòn, nước mắm tỏi ớt', 30000, '/images/menu/dui_ga_chien_nuoc_mam.png', 'com', true, false),
('Vịt Xào Gừng', 'Vịt xào gừng thơm nồng', 30000, '/images/menu/vit_xao_gung.png', 'com', true, false),
('Gà Xào Sả Ớt', 'Gà xào sả ớt cay nhẹ', 30000, '/images/menu/ga_xao_sa_ot.png', 'com', true, false);

-- Món Cá
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Cá Rô Kho Mỡ Hành', 'Cá rô kho mỡ hành đậm đà', 30000, '/images/menu/ca_ro_kho_mo_hanh.png', 'com', true, false),
('Cá Ngừ Kho Khóm', 'Cá ngừ kho khóm chua ngọt', 30000, '/images/menu/ca_ngu_kho_khom.png', 'com', true, false),
('Bún Cá Basa Kho', 'Bún ăn kèm cá basa kho đậm đà', 30000, '/images/menu/bun_ca_basa_kho.png', 'pho', true, false),
('Cá Lóc Muối Chiên', 'Cá lóc muối chiên giòn', 30000, '/images/menu/ca_loc_muoi_chien.png', 'com', true, false),
('Khô Cá Diều Chiên', 'Khô cá diều chiên giòn rụm', 30000, '/images/menu/kho_ca_dieu_chien.png', 'com', true, false);

-- Món Khác
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Đậu Hủ Dồn Thịt Sốt Cà', 'Đậu hủ dồn thịt sốt cà chua', 30000, '/images/menu/dau_hu_don_thit_sot_ca.png', 'com', true, false);

-- Canh
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Canh Chua Cá Ba', 'Canh chua cá ba thanh mát', 30000, '/images/menu/canh_chua_ca_ba.png', 'canh', true, false),
('Canh Khổ Qua Dồn Thịt - Cá Chả', 'Canh khổ qua dồn thịt và cá chả', 30000, '/images/menu/canh_kho_qua_don_thit.png', 'canh', true, false);

-- Cơm Chay
INSERT INTO public.products (name, description, price, image_url, category_id, is_active, is_sold_out) VALUES
('Đậu Hủ Chiên Sả', 'Đậu hủ chiên sả, dành cho cơm chay', 20000, '/images/menu/dau_hu_chien_sa.png', 'chay', true, false);

-- =====================================================
-- Verify seed data
-- =====================================================
-- Run this to check:
-- SELECT * FROM public.products ORDER BY category_id, name;
-- SELECT COUNT(*) FROM public.products; -- Should be 20 items
