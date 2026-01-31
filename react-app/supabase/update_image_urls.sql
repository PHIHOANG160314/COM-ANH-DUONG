-- Update menu item image URLs to use newly generated AI images
-- These images are located in /images/menu/ directory

-- Update based on Vietnamese dish names (matching existing menu items)
UPDATE menu_items SET image_url = '/images/menu/bac_xiu.png' WHERE name ILIKE '%Bạc Xỉu%';
UPDATE menu_items SET image_url = '/images/menu/ca_phe_sua_da.png' WHERE name ILIKE '%Cà Phê Sữa%';
UPDATE menu_items SET image_url = '/images/menu/sua_chua_danh_da.png' WHERE name ILIKE '%Sữa Chua%';
UPDATE menu_items SET image_url = '/images/menu/pho_bo_tai.png' WHERE name ILIKE '%Phở%';
UPDATE menu_items SET image_url = '/images/menu/bun_bo_hue.png' WHERE name ILIKE '%Bún Bò%';
UPDATE menu_items SET image_url = '/images/menu/com_suon_nuong.png' WHERE name ILIKE '%Cơm Sườn%';
UPDATE menu_items SET image_url = '/images/menu/com_ga_xoi_mo.png' WHERE name ILIKE '%Cơm Gà%';
UPDATE menu_items SET image_url = '/images/menu/banh_mi_dac_biet.png' WHERE name ILIKE '%Bánh Mì%';

-- Add more generic coffee images for items without specific images
UPDATE menu_items SET image_url = '/images/menu/ca_phe_sua_da.png' 
WHERE name ILIKE '%Cà Phê%' AND image_url IS NULL;

-- Verify updates
SELECT id, name, image_url FROM menu_items WHERE image_url IS NOT NULL ORDER BY id;
