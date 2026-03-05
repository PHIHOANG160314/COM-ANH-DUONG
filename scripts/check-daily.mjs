import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'admin@anhduong.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDaily() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
    });

    if (authError) {
        console.error('Failed to login as admin:', authError.message);
        return;
    }

    console.log('Logged in successfully block RLS');

    const today = dayjs().format('YYYY-MM-DD');
    console.log(`Seeding daily_menus for date: ${today}`);

    // Fetch some active products
    const { data: products, error: productError } = await supabase
        .from('menu_items')
        .select('id')
        .eq('is_available', true)
        .limit(10);

    if (productError || !products || products.length === 0) {
        console.error('Error fetching products:', productError);
        return;
    }

    const dailyMenus = products.map((p) => ({
        date: today,
        product_id: p.id,
        is_active: true,
    }));

    const { error } = await supabase
        .from('daily_menus')
        .upsert(dailyMenus, { onConflict: 'date, product_id' });

    if (error) {
        console.error('Error upserting daily menus:', error);
    } else {
        console.log(`Successfully seeded ${dailyMenus.length} items for today.`);
    }
}

seedDaily();
