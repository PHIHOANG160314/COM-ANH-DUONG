// Fix invalid IDs in Supabase daily_menu_config
const supabaseUrl = 'https://rnhtfaxqnvikedwufvcd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHRmYXhxbnZpa2Vkd3VmdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU5ODksImV4cCI6MjA4MjQ5MTk4OX0.4T0tGpULmokG-m5RJMWVy2IxluBiPYVOwUMVhyFQbSk';

async function fixDailyMenu() {
    console.log('🔧 Fixing Daily Menu Config...\n');

    // Get today's date in Vietnam timezone
    const vnDate = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
    console.log('📅 Today (VN):', vnDate);

    // Valid IDs only - use numeric IDs from data.js
    // Replacing invalid M031, M032, M033 with valid homemade dish IDs
    const validItems = [108, 109, 110, 111, 112, 113];
    // 108 = Tép gạo ram mặn ngọt
    // 109 = Đùi gà chiên nước mắm
    // 110 = Ếch chiên nước mắm
    // 111 = Vịt xào gừng
    // 112 = Gà xào sả ớt
    // 113 = Cá he kho lạt

    console.log('✅ Valid items to save:', validItems);

    // Update via REST API
    const response = await fetch(
        `${supabaseUrl}/rest/v1/daily_menu_config?active_date=eq.${vnDate}`,
        {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                active_items: validItems,
                updated_at: new Date().toISOString()
            })
        }
    );

    if (!response.ok) {
        console.error('❌ Error:', response.status, response.statusText);
        const text = await response.text();
        console.error(text);
        return;
    }

    const result = await response.json();
    console.log('\n📦 Updated config:', JSON.stringify(result, null, 2));
    console.log('\n✅ Fix complete! Customer page should now show 6 items.');
}

fixDailyMenu().catch(console.error);
