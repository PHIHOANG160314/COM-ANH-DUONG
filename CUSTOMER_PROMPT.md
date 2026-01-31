# Supabase Setup Task - Cơm Ánh Dương

## Objective

Configure Supabase database, generate menu images, and deploy to production.

## Prerequisites

- Supabase CLI: `npx supabase`
- Vercel CLI: `vercel`
- For image generation: Antigravity IDE with `generate_image` tool

---

## Task 1: Link Supabase Project

```bash
cd /Users/macbookprom1/mekong-cli/com-anh-duong-10x/react-app

npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

## Task 2: Push Database Migrations

```bash
cd /Users/macbookprom1/mekong-cli/com-anh-duong-10x/react-app

npx supabase db push
```

## Task 3: Create Storage Bucket

```bash
# Create bucket for menu images
npx supabase storage create menu-images --public
```

## Task 4: Generate Menu Images (Antigravity IDE)

For each product, generate a professional food image:

| Product          | Image Prompt                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Cơm Sườn Nướng   | Vietnamese grilled pork chop rice, professional food photography, white plate, natural lighting, top-down angle |
| Cơm Gà Xối Mỡ    | Vietnamese crispy fried chicken rice, professional food photography, golden brown skin, steaming rice           |
| Cơm Tấm Bì Chả   | Vietnamese broken rice with pork skin and egg meatloaf, traditional presentation                                |
| Phở Bò Tái       | Vietnamese beef pho, hot steaming bowl, fresh herbs, lime, bean sprouts                                         |
| Bún Bò Huế       | Vietnamese spicy beef noodle soup Hue style, red broth, beef shank, herbs                                       |
| Bánh Mì Đặc Biệt | Vietnamese banh mi sandwich, crusty baguette, pate, cold cuts, pickles, cilantro                                |

Save images to: `react-app/public/images/menu/`

## Task 5: Upload Images to Supabase Storage

```bash
cd /Users/macbookprom1/mekong-cli/com-anh-duong-10x/react-app

# Upload all generated images
for img in public/images/menu/*.webp; do
  npx supabase storage cp "$img" storage://menu-images/
done
```

## Task 6: Seed Data with Image URLs

```bash
# Update seed file to use Supabase Storage URLs
# Then run seed
npx supabase db execute --file supabase/seed_products.sql
```

## Task 7: Set Vercel Environment Variables

```bash
cd /Users/macbookprom1/mekong-cli/com-anh-duong-10x

SUPABASE_URL=$(npx supabase status | grep "API URL" | awk '{print $3}')
SUPABASE_ANON_KEY=$(npx supabase status | grep "anon key" | awk '{print $3}')

vercel env add VITE_SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add VITE_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"
```

## Task 8: Deploy

```bash
vercel --prod
```

## Task 9: Verify

```bash
curl -s https://comanhduong.com/menu | grep -q "Cơm Sườn" && echo "✅ Success" || echo "❌ Failed"
```

---

## Success Criteria

- ✅ Products table has 18+ items
- ✅ Menu images uploaded to Supabase Storage
- ✅ Website loads menu with real images
- ✅ No console errors
