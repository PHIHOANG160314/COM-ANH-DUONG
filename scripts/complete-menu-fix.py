#!/usr/bin/env python3
"""
Complete Menu Fix Script
1. Get current state of food menu (IDs 91+)
2. Identify the 4 missing items
3. Identify the 8 extra items to delete
4. Insert missing items + Delete extras = Exactly 58 items
"""

import os
import sys
import pandas as pd
from supabase import create_client, Client
from typing import List, Dict

# CRITICAL: Cá he kho mềm xương = 450,000đ
SPECIAL_PRICE_CORRECTIONS = {
    "Cá he kho - mềm xương": 450000
}

def get_supabase_client() -> Client:
    """Initialize Supabase client"""
    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_ANON_KEY")

    if not url or not key:
        print("❌ ERROR: Missing Supabase credentials")
        sys.exit(1)

    return create_client(url, key)

def load_target_menu() -> List[Dict]:
    """Load the 58 target items from Excel"""
    print("📖 Loading target menu from Excel...")
    df = pd.read_excel("menu mau (2).xlsx")

    items = []
    for _, row in df.iterrows():
        item = {
            "name": row["Tên món ăn"].strip(),
            "price": int(row["Giá bán (VNĐ)"]),
            "category_text": row["Loại món"].strip()
        }

        # Apply price corrections
        if item["name"] in SPECIAL_PRICE_CORRECTIONS:
            item["price"] = SPECIAL_PRICE_CORRECTIONS[item["name"]]

        items.append(item)

    print(f"✅ Loaded {len(items)} target items")
    return items

def get_current_food_menu(supabase: Client) -> List[Dict]:
    """Get current food menu items (ID >= 91)"""
    print("\n🔍 Fetching current food menu...")
    response = supabase.table("menu_items").select("*").gte("id", 91).order("id").execute()
    print(f"✅ Found {len(response.data)} food items in DB")
    return response.data

def analyze_differences(target: List[Dict], current: List[Dict]):
    """Analyze what's missing and what's extra"""
    print("\n📊 Analyzing differences...")

    # Create lookups
    target_names = {item["name"]: item for item in target}
    current_names = {item["name"]: item for item in current}

    # Find missing
    missing = []
    for name, item in target_names.items():
        if name not in current_names:
            missing.append(item)

    # Find extra
    extra = []
    for name, item in current_names.items():
        if name not in target_names:
            extra.append(item)

    print(f"\n📌 Missing items ({len(missing)}):")
    for item in missing:
        print(f"   - {item['name']} - {item['price']:,}đ")

    print(f"\n📌 Extra items to delete ({len(extra)}):")
    for item in extra:
        print(f"   - ID={item['id']}: {item['name']}")

    return missing, extra

def insert_missing_items(supabase: Client, items: List[Dict]):
    """Insert missing items - will bypass RLS using direct SQL if needed"""
    print(f"\n➕ Attempting to insert {len(items)} missing items...")

    success_count = 0
    failed = []

    for item in items:
        try:
            # Try normal insert
            supabase.table("menu_items").insert({
                "name": item["name"],
                "price": item["price"],
                "category_id": "rice",  # Món Cơm
                "is_available": True
            }).execute()
            print(f"   ✅ {item['name']} - {item['price']:,}đ")
            success_count += 1
        except Exception as e:
            print(f"   ❌ Failed: {item['name']} - {str(e)[:80]}")
            failed.append(item)

    print(f"\n✅ Inserted: {success_count}/{len(items)}")

    if failed:
        print(f"\n⚠️  Failed to insert {len(failed)} items due to RLS.")
        print("   These need to be inserted via Supabase SQL Editor:")
        print("\n   -- SQL to run in Supabase SQL Editor:")
        for item in failed:
            print(f"   INSERT INTO menu_items (name, price, category_id, is_available)")
            print(f"   VALUES ('{item['name']}', {item['price']}, 'rice', true);")
        print("")

def delete_extra_items(supabase: Client, items: List[Dict]):
    """Delete extra items"""
    print(f"\n🗑️  Deleting {len(items)} extra items...")

    success_count = 0
    for item in items:
        try:
            supabase.table("menu_items").delete().eq("id", item["id"]).execute()
            print(f"   ✅ Deleted ID={item['id']}: {item['name']}")
            success_count += 1
        except Exception as e:
            print(f"   ❌ Failed to delete ID={item['id']}: {e}")

    print(f"\n✅ Deleted: {success_count}/{len(items)}")

def verify_final_state(supabase: Client, expected_count: int = 58):
    """Verify we have exactly 58 food items"""
    print(f"\n🔍 Verifying final state...")
    response = supabase.table("menu_items").select("id", count="exact").gte("id", 91).execute()

    actual_count = response.count
    if actual_count == expected_count:
        print(f"✅ SUCCESS! Database has exactly {expected_count} food items")
        return True
    else:
        print(f"❌ Database has {actual_count} items, expected {expected_count}")
        print(f"   Difference: {actual_count - expected_count}")
        return False

def main():
    print("=" * 60)
    print("🛠️  COMPLETE MENU FIX SCRIPT")
    print("=" * 60)

    # Step 1: Load target menu
    target_items = load_target_menu()

    # Step 2: Connect and get current state
    supabase = get_supabase_client()
    current_items = get_current_food_menu(supabase)

    # Step 3: Analyze differences
    missing, extra = analyze_differences(target_items, current_items)

    # Step 4: Confirm actions
    print(f"\n⚠️  Ready to fix menu:")
    print(f"   - INSERT: {len(missing)} missing items")
    print(f"   - DELETE: {len(extra)} extra items")
    print(f"   - Result: {len(current_items)} - {len(extra)} + {len(missing)} = {len(current_items) - len(extra) + len(missing)} items")

    response = input("\nProceed? (yes/no): ")
    if response.lower() != "yes":
        print("❌ Cancelled")
        return

    # Step 5: Execute fixes
    if extra:
        delete_extra_items(supabase, extra)

    if missing:
        insert_missing_items(supabase, missing)

    # Step 6: Verify
    verify_final_state(supabase, expected_count=58)

if __name__ == "__main__":
    main()
