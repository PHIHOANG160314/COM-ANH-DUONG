# Cơm Ánh Dương - Incremental Update

> **Prerequisite**: You already ran the initial setup (Tasks 1-6).
> This prompt adds image generation and storage capabilities.

## Step 1: Pull Latest Code

```bash
cd /Users/macbookprom1/mekong-cli/com-anh-duong-10x
git pull origin main
```

## Step 2: Create Storage Bucket

```bash
cd react-app
npx supabase storage create menu-images --public
```

## Step 3: Generate Menu Images

Use `generate_image` tool for each product:

| Món              | Prompt                                                                        |
| ---------------- | ----------------------------------------------------------------------------- |
| Cơm Sườn Nướng   | Vietnamese grilled pork chop rice, professional food photography, white plate |
| Cơm Gà Xối Mỡ    | Vietnamese crispy fried chicken rice, golden brown, steaming                  |
| Phở Bò Tái       | Vietnamese beef pho, hot steaming bowl, fresh herbs, lime                     |
| Bún Bò Huế       | Vietnamese spicy beef noodle soup Hue style, red broth                        |
| Bánh Mì Đặc Biệt | Vietnamese banh mi sandwich, crusty baguette, pate, cilantro                  |

Save to: `react-app/public/images/menu/`

## Step 4: Upload to Supabase Storage

```bash
cd react-app
for img in public/images/menu/*.webp; do
  npx supabase storage cp "$img" storage://menu-images/
done
```

## Step 5: Update Image URLs in Database

```bash
npx supabase db execute --file supabase/update_image_urls.sql
```

## Step 6: Verify

```bash
curl -s https://comanhduong.com/menu | head -100
```

---

## Success Criteria

- ✅ Storage bucket `menu-images` exists
- ✅ AI-generated images uploaded
- ✅ Menu displays with new images
