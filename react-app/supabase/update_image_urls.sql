-- =====================================================
-- UPDATE IMAGE URLs - After uploading to Supabase Storage
-- =====================================================

-- Get your project ref from: npx supabase status
-- Replace YOUR_PROJECT_REF below

UPDATE public.products SET image_url = 
  CASE name
    WHEN 'Cơm Sườn Nướng' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/com_suon_nuong.webp'
    WHEN 'Cơm Gà Xối Mỡ' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/com_ga_xoi_mo.webp'
    WHEN 'Cơm Tấm Bì Chả' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/com_tam_bi_cha.webp'
    WHEN 'Phở Bò Tái' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/pho_bo_tai.webp'
    WHEN 'Phở Gà Ta' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/pho_ga_ta.webp'
    WHEN 'Bún Bò Huế' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/bun_bo_hue.webp'
    WHEN 'Bún Chả Hà Nội' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/bun_cha_ha_noi.webp'
    WHEN 'Bánh Mì Đặc Biệt' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/banh_mi_dac_biet.webp'
    WHEN 'Bánh Mì Ốp La' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/banh_mi_op_la.webp'
    WHEN 'Bánh Mì Chảo' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/banh_mi_chao.webp'
    WHEN 'Cà Phê Sữa Đá' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/ca_phe_sua_da.webp'
    WHEN 'Trà Đào Cam Sả' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/tra_dao_cam_sa.webp'
    WHEN 'Sinh Tố Bơ' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/sinh_to_bo.webp'
    WHEN 'Chè Khúc Bạch' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/che_khuc_bach.webp'
    WHEN 'Flan Caramel' THEN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/menu-images/flan_caramel.webp'
    ELSE image_url
  END;

-- Verify update
SELECT name, image_url FROM public.products;
