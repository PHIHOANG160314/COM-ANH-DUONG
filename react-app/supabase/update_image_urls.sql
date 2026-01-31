-- Create storage bucket for menu images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('menu-images', 'menu-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to menu-images bucket
CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated upload" ON storage.objects
    FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'menu-images');

-- Update image URLs for menu items
-- Using relative paths that work with static hosting

UPDATE menu_items SET image_url = '/images/menu/com_suon_nuong.png'
WHERE name ILIKE '%cơm sườn%' OR name ILIKE '%com suon%';

UPDATE menu_items SET image_url = '/images/menu/com_ga_xoi_mo.png'
WHERE name ILIKE '%cơm gà%' OR name ILIKE '%com ga%' OR name ILIKE '%gà xối%';

UPDATE menu_items SET image_url = '/images/menu/pho_bo_tai.png'
WHERE name ILIKE '%phở bò%' OR name ILIKE '%pho bo%';

UPDATE menu_items SET image_url = '/images/menu/bun_bo_hue.png'
WHERE name ILIKE '%bún bò%' OR name ILIKE '%bun bo%';

UPDATE menu_items SET image_url = '/images/menu/banh_mi_dac_biet.png'
WHERE name ILIKE '%bánh mì%' OR name ILIKE '%banh mi%';

UPDATE menu_items SET image_url = '/images/menu/com_tam_bi_cha.png'
WHERE name ILIKE '%cơm tấm%' OR name ILIKE '%com tam%';

UPDATE menu_items SET image_url = '/images/menu/bac_xiu.png'
WHERE name ILIKE '%bạc xỉu%' OR name ILIKE '%bac xiu%';

UPDATE menu_items SET image_url = '/images/menu/ca_phe_sua_da.png'
WHERE name ILIKE '%cà phê%' OR name ILIKE '%ca phe%';

UPDATE menu_items SET image_url = '/images/menu/sua_chua_danh_da.png'
WHERE name ILIKE '%sữa chua%' OR name ILIKE '%sua chua%';
