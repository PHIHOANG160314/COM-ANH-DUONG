// scripts/seed-full-menu.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        if (!fs.existsSync(envPath)) return {};

        let content;
        const buffer = fs.readFileSync(envPath);

        // Handle UTF-16 LE (Windows)
        if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
            content = buffer.toString('utf16le').slice(1);
        } else {
            content = buffer.toString('utf8');
        }

        return content.split(/\r?\n/).reduce((acc, line) => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) acc[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            return acc;
        }, {});
    } catch (e) {
        console.error('Error loading .env:', e);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
// Check for Service Role Key in env or process
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin credentials for fallback (load from env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@anhduong.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

if (!supabaseUrl || (!supabaseKey && !serviceRoleKey)) {
    console.error('❌ Missing Supabase configuration.');
    process.exit(1);
}

// Use Service Role Key if available to bypass RLS, otherwise fallback to Anon Key
const useServiceKey = !!serviceRoleKey;
const supabase = createClient(supabaseUrl, useServiceKey ? serviceRoleKey : supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function loginAsAdmin() {
    if (useServiceKey) return true; // No need to login if using service key

    console.log(`Authenticating as ${ADMIN_EMAIL}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    if (error) {
        console.error('❌ Login failed:', error.message);
        return false;
    }

    console.log('✅ Login successful. Using authenticated session.');
    return true;
}

async function parseSqlFile() {
    const sqlPath = path.join(__dirname, '../sql/seed-full-menu.sql');
    if (!fs.existsSync(sqlPath)) {
        throw new Error(`SQL file not found at ${sqlPath}`);
    }

    const content = fs.readFileSync(sqlPath, 'utf8');

    // Regex to extract values between VALUES and the ending ;
    // This is a simple parser, might need adjustment if SQL format changes
    const valuesMatch = content.match(/VALUES\s+([\s\S]+?)\s+ON CONFLICT/i);
    if (!valuesMatch) {
        throw new Error('Could not find VALUES clause in SQL file');
    }

    const valuesStr = valuesMatch[1];
    // Split by ), ( to get individual rows
    // Remove starting ( and ending )
    const rows = valuesStr.split(/\),\s*\(/).map(row => {
        // Clean up row string
        const cleanRow = row.replace(/^\s*\(\s*/, '').replace(/\s*\)\s*$/, '');
        // Split by comma, handling quotes
        // This is tricky with simple split if strings contain commas.
        // Assuming simple format based on known file content: id, name, price, category_id, is_available

        // Manual parsing for: id, 'Name', price, 'cat', true/false
        const parts = [];
        let current = '';
        let inQuote = false;

        for (let i = 0; i < cleanRow.length; i++) {
            const char = cleanRow[i];
            if (char === "'") {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                parts.push(current.trim());
                current = '';
                continue;
            }
            current += char;
        }
        parts.push(current.trim());

        return {
            id: parseInt(parts[0]),
            name: parts[1].replace(/^'|'$/g, ''),
            price: parseInt(parts[2]),
            category_id: parts[3].replace(/^'|'$/g, ''),
            is_available: parts[4] === 'true'
        };
    });

    return rows;
}

async function main() {
    console.log(`=== SEED FULL MENU ===`);
    console.log(`Mode: ${useServiceKey ? 'SERVICE_ROLE (RLS Bypassed)' : 'ANON_KEY (Subject to RLS)'}`);

    try {
        if (!useServiceKey) {
            const loggedIn = await loginAsAdmin();
            if (!loggedIn) {
                console.error('❌ Could not log in as admin. Aborting to prevent RLS errors.');
                process.exit(1);
            }
        }

        const menuItems = await parseSqlFile();
        console.log(`Parsed ${menuItems.length} items from SQL file.`);

        const categories = [
            { id: 'drinks', name: 'Đồ Uống', order: 1, is_active: true },
            { id: 'food', name: 'Thức Ăn', order: 2, is_active: true },
            { id: 'dessert', name: 'Tráng Miệng', order: 3, is_active: true },
        ];

        console.log('1. Upserting categories...');
        const { error: catError } = await supabase
            .from('categories')
            .upsert(categories, { onConflict: 'id' });

        if (catError) {
            console.error('❌ Category error:', catError.message);
            if (!useServiceKey) console.log('👉 Hint: You may need the SUPABASE_SERVICE_ROLE_KEY to bypass RLS.');
        } else {
            console.log('✅ Categories seeded.');
        }

        console.log('2. Upserting menu items...');
        const batchSize = 50;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < menuItems.length; i += batchSize) {
            const batch = menuItems.slice(i, i + batchSize);
            const { error } = await supabase
                .from('menu_items')
                .upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error(`❌ Batch ${i/batchSize + 1} error:`, error.message);
                errorCount += batch.length;
            } else {
                successCount += batch.length;
                console.log(`   Batch ${i/batchSize + 1}: ${batch.length} items OK`);
            }
        }

        console.log(`\n=== SUMMARY ===`);
        console.log(`Success: ${successCount}`);
        console.log(`Failed: ${errorCount}`);

    } catch (err) {
        console.error('Fatal error:', err);
    }
}

main();
