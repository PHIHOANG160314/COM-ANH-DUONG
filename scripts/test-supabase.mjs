import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read .env file with UTF-16 encoding
let envContent
try {
    envContent = readFileSync('.env', 'utf-16le')
} catch (e) {
    envContent = readFileSync('.env', 'utf-8')
}

// Clean BOM and parse
envContent = envContent.replace(/^\uFEFF/, '')
const envVars = {}
envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
        const eqIndex = line.indexOf('=')
        if (eqIndex > 0) {
            const key = line.substring(0, eqIndex).trim()
            const value = line.substring(eqIndex + 1).trim()
            envVars[key] = value
        }
    }
})

console.log("📋 Loaded env vars:", Object.keys(envVars).join(', '));

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Lỗi: Không tìm thấy URL hoặc Key!");
    process.exit(1);
}

console.log("📋 Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log("⏳ Đang kết nối tới Supabase...\n");

    // Test menu_items
    const { data, error } = await supabase.from('menu_items').select('*').limit(3);

    if (error) {
        console.error("❌ menu_items error:", error.message);
    } else {
        console.log("✅ menu_items: Found", data?.length || 0, "items");
    }

    // Test daily_menus
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyData, error: dailyError } = await supabase
        .from('daily_menus')
        .select('*')
        .eq('date', today);

    if (dailyError) {
        console.error("❌ daily_menus error:", dailyError.message);
    } else {
        console.log("✅ daily_menus:", dailyData?.length || 0, "items for", today);
        if (dailyData && dailyData.length > 0) {
            console.log("📋 Data:", JSON.stringify(dailyData, null, 2));

            const productIds = dailyData.filter(d => d.is_active).map(d => d.product_id);
            if (productIds.length > 0) {
                console.log("\n⏳ Fetching menu_items by IDs:", productIds);

                const { data: menuData, error: menuError } = await supabase
                    .from('menu_items')
                    .select('*')
                    .in('id', productIds);

                if (menuError) {
                    console.error("❌ ERROR:", menuError.message, menuError.code, menuError.hint);
                } else {
                    console.log("✅ Found", menuData?.length || 0, "matching menu items");
                }
            }
        }
    }
}

testConnection()
