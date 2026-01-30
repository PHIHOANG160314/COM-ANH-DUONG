// Test daily menu config via REST API (no external deps)
const supabaseUrl = 'https://rnhtfaxqnvikedwufvcd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHRmYXhxbnZpa2Vkd3VmdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU5ODksImV4cCI6MjA4MjQ5MTk4OX0.4T0tGpULmokG-m5RJMWVy2IxluBiPYVOwUMVhyFQbSk';

async function testDailyMenu() {
    console.log('🔍 Testing Daily Menu Sync via REST API...\n');

    const response = await fetch(
        `${supabaseUrl}/rest/v1/daily_menu_config?order=active_date.desc&limit=1`,
        {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        console.error('❌ Error:', response.status, response.statusText);
        const text = await response.text();
        console.error(text);
        return;
    }

    const data = await response.json();
    console.log('📦 Current config:', JSON.stringify(data, null, 2));

    if (data && data.length > 0) {
        const config = data[0];
        console.log('\n📊 Analysis:');
        console.log('   Active Date:', config.active_date);
        console.log('   Active Items:', JSON.stringify(config.active_items));
        console.log('   Item Count:', config.active_items?.length || 0);

        // Validate IDs
        console.log('\n🔎 ID Validation (after stripping M prefix):');
        const items = config.active_items || [];
        const validMenuIds = [
            // Drinks 1-45
            ...Array.from({ length: 30 }, (_, i) => i + 1),
            ...Array.from({ length: 14 }, (_, i) => i + 36),
            // Food 51-120
            ...Array.from({ length: 70 }, (_, i) => i + 51)
        ];

        let validCount = 0;
        let invalidCount = 0;

        items.forEach(id => {
            const strId = String(id);
            const numId = parseInt(strId.replace('M', '').replace(/^0+/, ''));
            const isValid = validMenuIds.includes(numId);
            console.log(`   ${id} → ${numId} : ${isValid ? '✅ Valid' : '❌ INVALID'}`);
            if (isValid) validCount++; else invalidCount++;
        });

        console.log(`\n📈 Summary: ${validCount} valid, ${invalidCount} invalid IDs`);
    }

    console.log('\n✅ Test complete!');
}

testDailyMenu().catch(console.error);
