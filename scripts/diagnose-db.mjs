
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file (handles UTF-16 encoding)
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    let content;

    try {
        // Try UTF-16 first (Windows sometimes uses this)
        const buffer = fs.readFileSync(envPath);
        if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
            content = buffer.toString('utf16le').slice(1);
        } else {
            content = buffer.toString('utf8');
        }
    } catch (e) {
        console.error('Could not read .env file:', e.message);
        process.exit(1);
    }

    const lines = content.split(/\r?\n/);
    const env = {};
    for (const line of lines) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    }
    return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('=== DIAGNOSE DB ===');
    console.log(`Supabase URL: ${supabaseUrl}`);

    // 1. Try to login
    console.log('\n1. Attempting login as admin@anhduong.com...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@anhduong.com',
        password: 'password123'
    });

    if (authError) {
        console.log('   Login failed:', authError.message);
    } else {
        console.log('   Login successful!');
        console.log('   User ID:', authData.user.id);
        console.log('   Role:', authData.user.role);
    }

    // 2. Inspect Categories
    console.log('\n2. Inspecting categories table...');
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .limit(1);

    if (catError) {
        console.error('   Error fetching categories:', catError.message);
    } else {
        if (categories.length > 0) {
            console.log('   Sample category keys:', Object.keys(categories[0]));
        } else {
            console.log('   Categories table is empty, cannot inspect keys directly.');
        }
    }

    // 3. Inspect Menu Items
    console.log('\n3. Inspecting menu_items table...');
    const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .limit(1);

    if (menuError) {
        console.error('   Error fetching menu_items:', menuError.message);
    } else {
        if (menuItems.length > 0) {
            console.log('   Sample menu_item keys:', Object.keys(menuItems[0]));
        } else {
            console.log('   Menu_items table is empty, cannot inspect keys directly.');
        }
    }
}

main().catch(console.error);
