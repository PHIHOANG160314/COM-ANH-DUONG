// Migration Script: Generate SQL to import data.js items to menu_items table
// Motivation: API inserts failed due to RLS policies. SQL bypasses this when run in Editor.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

async function migrate() {
    console.log('🚀 Starting migration setup...');

    // 1. Read data.js
    const dataJsPath = path.join(__dirname, '../js/data.js');
    console.log('📖 Reading data.js...');
    let fileContent = fs.readFileSync(dataJsPath, 'utf8');

    // 2. Extract items using VM sandbox
    // Mock browser environment
    const sandbox = {
        window: {},
        menuItems: [],
        inventoryData: [],
        recipes: [],
        menuSubcategories: {},
        featuredItems: [],
        localStorage: { getItem: () => null, setItem: () => { }, removeItem: () => { }, clear: () => { } },
        document: { getElementById: () => null, querySelector: () => null, createElement: () => ({ classList: { add: () => { } } }) },
        console: { log: () => { }, warn: () => { }, error: () => { } },
        location: { search: '' },
        URLSearchParams: class { get() { return null; } }
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);

    try {
        vm.runInContext(fileContent, sandbox);
    } catch (e) {
        console.warn('⚠️  Error evaluating data.js:', e.message);
    }

    const items = sandbox.menuItems || sandbox.window.menuItems;

    if (!items || items.length === 0) {
        console.error('❌ No items found in data.js');
        process.exit(1);
    }

    console.log(`✅ Found ${items.length} items to migrate.`);

    // 3. Generate SQL script
    console.log('📝 Generating SQL script...');

    let sqlContent = `-- Migration: Import data.js items to menu_items table
-- Generated at ${new Date().toISOString()}

INSERT INTO menu_items (id, name, price, category_id, subcategory_id, icon, cost, is_available, is_featured, updated_at)
VALUES
`;

    items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const safeName = item.name.replace(/'/g, "''"); // Escape single quotes
        const safeIcon = (item.icon || '').replace(/'/g, "''");

        // FIX: No semicolon here, comma for all except last (which also has no comma or semicolon if followed by ON CONFLICT)
        // Actually, for multiple rows in VALUES, format is: (row1), (row2) ...
        // And if we have ON CONFLICT, we just end the VALUES list and start ON CONFLICT.
        // So the last item should NOT have a comma, and also NO semicolon.

        sqlContent += `(${item.id}, '${safeName}', ${item.price}, '${item.category}', '${item.subcategory}', '${safeIcon}', ${item.cost || 0}, true, false, NOW())${isLast ? '' : ','}\n`;
    });

    // Handle conflict (Upsert) - Semicolon goes at the VERY END
    sqlContent += `
-- On conflict, update price and name
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    cost = EXCLUDED.cost,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    icon = EXCLUDED.icon,
    updated_at = NOW();
`;

    const outputPath = path.join(__dirname, '../sql/import-menu-items.sql');
    fs.writeFileSync(outputPath, sqlContent);

    console.log(`\n🎉 SQL Script Generated: ${outputPath}`);
    console.log(`   Contains ${items.length} items.`);
}

migrate();
