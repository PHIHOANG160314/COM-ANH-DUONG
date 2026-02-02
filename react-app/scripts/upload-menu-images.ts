/**
 * Upload Menu Images to Supabase Storage
 *
 * This script uploads all menu images from public/images/menu to Supabase Storage bucket "menu-images"
 *
 * Usage: npm run upload-images
 *
 * Requirements:
 * - VITE_SUPABASE_URL in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local (get from Supabase Dashboard > Settings > API)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'menu-images';
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'menu');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Error: Missing environment variables');
    console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.error('   Get SERVICE_ROLE_KEY from: Supabase Dashboard → Settings → API → service_role key');
    process.exit(1);
}

if (SERVICE_ROLE_KEY.includes('KHÁCH') || SERVICE_ROLE_KEY.includes('<')) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is still a placeholder');
    console.error('   Please replace it with your actual service_role key from Supabase Dashboard');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

interface Bucket {
    name: string;
}

async function ensureBucketExists() {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('❌ Error listing buckets:', listError.message);
        process.exit(1);
    }

    const bucketExists = buckets?.some((b: Bucket) => b.name === BUCKET_NAME);

    if (bucketExists) {
        console.log('✅ Bucket exists:', BUCKET_NAME);
        return;
    }

    // Create bucket
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    });

    if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        process.exit(1);
    }

    console.log('✅ Bucket created:', BUCKET_NAME);
}

async function uploadImages() {
    // Check if images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('❌ Error: Images directory not found:', IMAGES_DIR);
        process.exit(1);
    }

    // Get all image files
    const files = fs.readdirSync(IMAGES_DIR).filter((file: string) => /\.(png|jpg|jpeg|webp|gif)$/i.test(file));

    console.log(`📁 Images Found: ${files.length}`);

    if (files.length === 0) {
        console.log('⚠️ No images found to upload');
        return;
    }

    let uploaded = 0;
    let errors = 0;

    const contentTypeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
    };

    for (const file of files) {
        const filePath = path.join(IMAGES_DIR, file);
        const fileBuffer = fs.readFileSync(filePath);

        // Determine content type
        const ext = path.extname(file).toLowerCase();
        const contentType = contentTypeMap[ext] || 'image/png';

        const { error } = await supabase.storage.from(BUCKET_NAME).upload(file, fileBuffer, {
            contentType,
            upsert: true, // Overwrite if exists
        });

        if (error) {
            console.error(`❌ Error uploading ${file}:`, error.message);
            errors++;
        } else {
            console.log(`✅ Uploaded: ${file}`);
            uploaded++;
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   Uploaded: ${uploaded}`);
    console.log(`   Errors: ${errors}`);

    if (errors === 0) {
        console.log('\n🎉 All images uploaded successfully!');

        // Print public URLs
        console.log('\n📎 Public URLs:');
        for (const file of files) {
            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file);
            console.log(`   ${file}: ${data.publicUrl}`);
        }
    }
}

async function main() {
    console.log('🚀 Starting Menu Images Upload...\n');
    console.log(`   Supabase URL: ${SUPABASE_URL}`);
    console.log(`   Bucket: ${BUCKET_NAME}`);
    console.log(`   Images Dir: ${IMAGES_DIR}\n`);

    await ensureBucketExists();
    await uploadImages();
}

main().catch(console.error);
