import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkData() {
    console.log('Checking menu_items...');
    const { data, error } = await supabase.from('menu_items').select('id, name, price, is_active');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const activeCount = data?.filter(d => d.is_active === true).length || 0;
    const inactiveCount = data?.filter(d => d.is_active !== true).length || 0;

    console.log('Total items:', data?.length || 0);
    console.log('Active (is_active=true):', activeCount);
    console.log('Inactive/null:', inactiveCount);
    console.log('\\nFirst 5 items with is_active:');
    console.log(JSON.stringify(data?.slice(0, 5), null, 2));
}

checkData();
