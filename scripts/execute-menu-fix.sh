#!/bin/bash
# Execute SQL via Supabase REST API RPC endpoint

export VITE_SUPABASE_URL="https://rnhtfaxqnvikedwufvcd.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHRmYXhxbnZpa2Vkd3VmdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU5ODksImV4cCI6MjA4MjQ5MTk4OX0.4T0tGpULmokG-m5RJMWVy2IxluBiPYVOwUMVhyFQbSk"

# Since REST API won't work for raw SQL, let's try creating a Python script
# that uses the service role key if available, or we'll need to use the dashboard

echo "❌ Cannot execute SQL directly via anon key (RLS restrictions)"
echo "✅ Alternative: Using Python with Supabase library"

python3 << 'PYTHON_SCRIPT'
from supabase import create_client
import os

url = "https://rnhtfaxqnvikedwufvcd.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHRmYXhxbnZpa2Vkd3VmdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTU5ODksImV4cCI6MjA4MjQ5MTk4OX0.4T0tGpULmokG-m5RJMWVy2IxluBiPYVOwUMVhyFQbSk"

supabase = create_client(url, key)

print("🚀 Executing menu fix operations...")

# IDs to delete
delete_ids = [97, 107, 113, 132, 149, 150, 151, 152, 153, 154, 155, 156]

print(f"\n🗑️ Step 1: Deleting {len(delete_ids)} extra items...")
deleted_count = 0
for item_id in delete_ids:
    try:
        supabase.table("menu_items").delete().eq("id", item_id).execute()
        deleted_count += 1
        print(f"  ✅ Deleted ID {item_id}")
    except Exception as e:
        print(f"  ❌ Failed ID {item_id}: {str(e)[:50]}")

print(f"\n✅ Deleted: {deleted_count}/{len(delete_ids)}")

# Items to insert
insert_items = [
    {"name": "Sườn + trứng - chiên", "price": 30000},
    {"name": "Cá cơm - mồm kho lạt (xoài bằm)", "price": 30000},
    {"name": "Cá he kho - mềm xương", "price": 450000},
    {"name": "Tép gạo ram mặm", "price": 35000}
]

print(f"\n➕ Step 2: Inserting {len(insert_items)} missing items...")
inserted_count = 0
failed_items = []

for item in insert_items:
    try:
        supabase.table("menu_items").insert({
            "name": item["name"],
            "price": item["price"],
            "category_id": "rice",
            "is_available": True
        }).execute()
        inserted_count += 1
        print(f"  ✅ {item['name']} - {item['price']:,}đ")
    except Exception as e:
        failed_items.append(item)
        print(f"  ❌ {item['name']} - RLS blocked")

print(f"\n✅ Inserted: {inserted_count}/{len(insert_items)}")

if failed_items:
    print(f"\n⚠️ {len(failed_items)} items blocked by RLS - need service role key")
    print("\nSQL to run in Supabase Dashboard:")
    for item in failed_items:
        print(f"INSERT INTO menu_items (name, price, category_id, is_available)")
        print(f"VALUES ('{item['name']}', {item['price']}, 'rice', true);")

# Verify
import time
time.sleep(1)
response = supabase.table("menu_items").select("id", count="exact").gte("id", 91).execute()
print(f"\n🔍 Verification:")
print(f"Food menu items: {response.count}")
if response.count == 58:
    print("✅ SUCCESS! Exactly 58 items")
else:
    print(f"❌ Expected 58, got {response.count}")

PYTHON_SCRIPT
