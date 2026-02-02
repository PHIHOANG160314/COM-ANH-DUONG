import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Constants
const IMAGES_DIR = path.resolve(__dirname, '../public/images/menu');
const BUCKET_NAME = 'menu-images';

// Helper to normalize strings for matching
// e.g., "Bánh Mì Đặc Biệt" -> "banh_mi_dac_biet"
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

const main = async () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials.');
    console.error(
      'Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env or .env.local'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log(`Connecting to Supabase at ${supabaseUrl}...`);

  // 1. Ensure bucket exists
  console.log(`Checking bucket '${BUCKET_NAME}'...`);
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

  if (bucketError) {
    console.error('Error listing buckets:', bucketError);
    return;
  }

  const bucketExists = buckets.find((b) => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`Creating bucket '${BUCKET_NAME}'...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      return;
    }
    console.log('✅ Bucket created.');
  } else {
    console.log('✅ Bucket exists.');
  }

  // 2. Read local images
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
    return;
  }

  const files = fs.readdirSync(IMAGES_DIR).filter((file) => file.match(/\.(png|jpg|jpeg)$/i));
  console.log(`Found ${files.length} images to upload.`);

  // 3. Upload images and update DB
  let uploadedCount = 0;
  let updatedDbCount = 0;

  // Get all menu items first to minimize queries
  const { data: menuItems, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, name, image_url');

  if (fetchError) {
    console.error('Error fetching menu items:', fetchError);
    // Continue with upload even if DB fetch fails?
    // Maybe we just want to upload.
  }

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    const fileMime = file.endsWith('.png') ? 'image/png' : 'image/jpeg';

    console.log(`Processing ${file}...`);

    // Upload
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, fileBuffer, {
        contentType: fileMime,
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ❌ Upload failed for ${file}:`, uploadError.message);
      continue;
    }

    uploadedCount++;
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file);

    console.log(`  ✅ Uploaded: ${publicUrl}`);

    // Update Database
    if (menuItems) {
      // Find matching item
      const fileNameWithoutExt = file.replace(/\.(png|jpg|jpeg)$/i, '');

      const matchedItems = menuItems.filter((item) => {
        // Match by exact filename in current URL
        if (item.image_url && item.image_url.includes(file)) return true;

        // Match by normalized name
        const normalizedItemName = normalizeName(item.name);
        if (normalizedItemName === fileNameWithoutExt) return true;

        return false;
      });

      if (matchedItems.length > 0) {
        for (const item of matchedItems) {
          if (item.image_url === publicUrl) {
            console.log(`  ℹ️  DB (menu_items) already up to date for "${item.name}"`);
            continue;
          }

          const { error: updateError } = await supabase
            .from('menu_items')
            .update({ image_url: publicUrl })
            .eq('id', item.id);

          if (updateError) {
            console.error(
              `  ❌ DB (menu_items) update failed for "${item.name}":`,
              updateError.message
            );
          } else {
            console.log(`  ✨ DB (menu_items) updated for "${item.name}"`);
            updatedDbCount++;
          }
        }
      }
    }

    // Also update 'products' table (legacy/admin) if it exists
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, image_url');

    if (!productsError && products) {
      const fileNameWithoutExt = file.replace(/\.(png|jpg|jpeg)$/i, '');

      const matchedProducts = products.filter((item) => {
        // Match by exact filename in current URL
        if (item.image_url && item.image_url.includes(file)) return true;

        // Match by normalized name
        const normalizedItemName = normalizeName(item.name);
        if (normalizedItemName === fileNameWithoutExt) return true;

        return false;
      });

      for (const item of matchedProducts) {
        if (item.image_url === publicUrl) {
          // console.log(`  ℹ️  DB (products) already up to date for "${item.name}"`);
          continue;
        }

        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: publicUrl })
          .eq('id', item.id);

        if (updateError) {
          console.error(
            `  ❌ DB (products) update failed for "${item.name}":`,
            updateError.message
          );
        } else {
          console.log(`  ✨ DB (products) updated for "${item.name}"`);
          updatedDbCount++;
        }
      }
    }
  }

  console.log('-----------------------------------');
  console.log(`Summary:`);
  console.log(`- Images Found: ${files.length}`);
  console.log(`- Uploaded: ${uploadedCount}`);
  console.log(`- DB Records Updated: ${updatedDbCount}`);
};

main().catch(console.error);
