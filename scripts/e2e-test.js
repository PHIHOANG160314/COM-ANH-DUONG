// End-to-End Test: Simulate Customer Page Menu Filtering
// This simulates exactly what customer-app.js does

const supabaseUrl = 'https://rnhtfaxqnvikedwufvcd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHRmYXhxbnZpa2Vkd3VmdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU5ODksImV4cCI6MjA4MjQ5MTk4OX0.4T0tGpULmokG-m5RJMWVy2IxluBiPYVOwUMVhyFQbSk';

// Simulated data.js items (IDs 108-113)
const menuItems = [
    { id: 108, name: "Tép gạo ram mặn ngọt", price: 30000, category: "food" },
    { id: 109, name: "Đùi gà chiên nước mắm", price: 30000, category: "food" },
    { id: 110, name: "Ếch chiên nước mắm", price: 30000, category: "food" },
    { id: 111, name: "Vịt xào gừng", price: 30000, category: "food" },
    { id: 112, name: "Gà xào sả ớt", price: 30000, category: "food" },
    { id: 113, name: "Cá he kho lạt", price: 35000, category: "food" }
];

async function e2eTest() {
    console.log('═══════════════════════════════════════════════');
    console.log('🔬 E2E TEST: Customer Page Menu Filtering');
    console.log('═══════════════════════════════════════════════\n');

    // Step 1: Fetch from Supabase (like customer-app.js does)
    console.log('📡 Step 1: Fetching daily_menu_config from Supabase...');
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

    const data = await response.json();
    const config = data[0];
    console.log('   ✅ Received:', config.active_items.length, 'active item IDs');

    // Step 2: Simulate filterDailyMenu logic (from customer-app.js)
    console.log('\n🔄 Step 2: Running filterDailyMenu logic...');

    // This is exactly what customer-app.js does:
    const activeIds = config.active_items.map(id => {
        const idStr = String(id);
        // Strip "M" prefix if present (e.g., "M110" -> "110")
        return idStr.startsWith('M') ? idStr.substring(1) : idStr;
    });
    console.log('   Active IDs (normalized):', activeIds);

    // Filter menu items
    const filteredMenu = menuItems.filter(item => activeIds.includes(String(item.id)));

    // Step 3: Display results
    console.log('\n📋 Step 3: Filtered Menu Results');
    console.log('─────────────────────────────────────────────');
    filteredMenu.forEach((item, i) => {
        console.log(`   ${i + 1}. [${item.id}] ${item.name} - ${item.price.toLocaleString()}đ`);
    });
    console.log('─────────────────────────────────────────────');

    // Final verdict
    console.log('\n═══════════════════════════════════════════════');
    if (filteredMenu.length === config.active_items.length) {
        console.log('✅ E2E TEST PASSED!');
        console.log(`   Expected: ${config.active_items.length} items`);
        console.log(`   Actual: ${filteredMenu.length} items`);
        console.log('   All menu items matched correctly!');
    } else {
        console.log('❌ E2E TEST FAILED!');
        console.log(`   Expected: ${config.active_items.length} items`);
        console.log(`   Actual: ${filteredMenu.length} items`);
    }
    console.log('═══════════════════════════════════════════════');
}

e2eTest().catch(console.error);
