#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Get Supabase credentials from env
const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing credentials. Need:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service_role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMenuFix() {
  console.log('🚀 Starting menu fix...\n');

  // Step 1: Delete 12 extra items
  console.log('Step 1: Deleting 12 extra items...');
  const deleteIds = [97, 107, 113, 132, 149, 150, 151, 152, 153, 154, 155, 156];

  const { error: deleteError, count: deleteCount } = await supabase
    .from('menu_items')
    .delete({ count: 'exact' })
    .in('id', deleteIds);

  if (deleteError) {
    console.error('❌ Delete failed:', deleteError);
    process.exit(1);
  }
  console.log(`✅ Deleted ${deleteCount} items\n`);

  // Step 2: Insert 4 missing items
  console.log('Step 2: Inserting 4 missing items...');
  const newItems = [
    { name: 'Sườn + trứng - chiên', price: 30000, category_id: 'rice', is_available: true },
    { name: 'Cá cơm - mồm kho lạt (xoài bằm)', price: 30000, category_id: 'rice', is_available: true },
    { name: 'Cá he kho - mềm xương', price: 450000, category_id: 'rice', is_available: true },
    { name: 'Tép gạo ram mặm', price: 35000, category_id: 'rice', is_available: true }
  ];

  const { error: insertError, count: insertCount } = await supabase
    .from('menu_items')
    .insert(newItems, { count: 'exact' });

  if (insertError) {
    console.error('❌ Insert failed:', insertError);
    process.exit(1);
  }
  console.log(`✅ Inserted ${insertCount} items\n`);

  // Step 3: Verify total count
  console.log('Step 3: Verifying total count...');
  const { count: totalCount, error: countError } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .gte('id', 91);

  if (countError) {
    console.error('❌ Count verification failed:', countError);
    process.exit(1);
  }
  console.log(`✅ Total food items (id >= 91): ${totalCount}`);

  if (totalCount !== 58) {
    console.warn(`⚠️  Expected 58, got ${totalCount}`);
  }

  // Step 4: Verify Cá he kho price
  console.log('\nStep 4: Verifying Cá he kho price...');
  const { data: caHeKho, error: priceError } = await supabase
    .from('menu_items')
    .select('id, name, price')
    .eq('name', 'Cá he kho - mềm xương')
    .single();

  if (priceError) {
    console.error('❌ Price verification failed:', priceError);
    process.exit(1);
  }

  console.log(`✅ Found: ${caHeKho.name}`);
  console.log(`   ID: ${caHeKho.id}`);
  console.log(`   Price: ${caHeKho.price}`);

  if (caHeKho.price !== 450000) {
    console.error(`❌ WRONG PRICE! Expected 450000, got ${caHeKho.price}`);
    process.exit(1);
  }

  console.log('\n🎉 Menu fix completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Deleted: ${deleteCount} items`);
  console.log(`   - Inserted: ${insertCount} items`);
  console.log(`   - Total count: ${totalCount}`);
  console.log(`   - Cá he kho price: ${caHeKho.price} ✓`);
}

executeMenuFix().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
