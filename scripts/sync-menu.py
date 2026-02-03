#!/usr/bin/env python3
"""
Menu Sync Script - Sync 58 menu items from Excel to Supabase
Follows Binh Pháp strategy - precise execution, no compromises
"""

import os
import sys
import json
import pandas as pd
from supabase import create_client, Client
from typing import List, Dict, Tuple

# CRITICAL: Cá he kho mềm xương = 450,000đ (not 45,000đ)
SPECIAL_PRICE_CORRECTIONS = {
    "Cá he kho - mềm xương": 450000
}

def load_excel_menu(filepath: str) -> List[Dict]:
    """Load and parse Excel menu file"""
    print(f"📖 Reading Excel file: {filepath}")
    df = pd.read_excel(filepath)

    # Convert to list of dicts
    menu_items = []
    for _, row in df.iterrows():
        item = {
            "name": row["Tên món ăn"].strip(),
            "price": int(row["Giá bán (VNĐ)"]),
            "category": row["Loại món"].strip(),
            "stt": int(row["STT"])
        }

        # Apply special price corrections
        if item["name"] in SPECIAL_PRICE_CORRECTIONS:
            item["price"] = SPECIAL_PRICE_CORRECTIONS[item["name"]]
            print(f"⚠️  Applied price correction: {item['name']} = {item['price']:,}đ")

        menu_items.append(item)

    print(f"✅ Loaded {len(menu_items)} items from Excel")
    return menu_items

def get_supabase_client() -> Client:
    """Initialize Supabase client from environment variables"""
    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_ANON_KEY")

    if not url or not key or "placeholder" in url:
        print("❌ ERROR: Supabase credentials not configured properly")
        print("   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY")
        sys.exit(1)

    return create_client(url, key)

def fetch_current_menu(supabase: Client) -> List[Dict]:
    """Fetch all menu items from Supabase"""
    print("🔍 Fetching current menu from Supabase...")

    try:
        response = supabase.table("menu_items").select("*").execute()
        items = response.data
        print(f"✅ Found {len(items)} items in database")
        return items
    except Exception as e:
        print(f"❌ Error fetching menu: {e}")
        return []

def calculate_diff(excel_items: List[Dict], db_items: List[Dict]) -> Tuple[List[Dict], List[Dict], List[int]]:
    """
    Calculate differences between Excel and DB
    Returns: (items_to_insert, items_to_update, ids_to_delete)
    """
    print("\n🔍 Calculating differences...")

    # Create lookup by name
    db_lookup = {item["name"]: item for item in db_items}
    excel_lookup = {item["name"]: item for item in excel_items}

    to_insert = []
    to_update = []
    to_delete = []

    # Find items to insert or update
    for excel_item in excel_items:
        name = excel_item["name"]
        if name not in db_lookup:
            # New item - INSERT
            to_insert.append(excel_item)
        else:
            # Existing item - check if UPDATE needed
            db_item = db_lookup[name]
            db_category = db_item.get("category", "")
            if (db_item["price"] != excel_item["price"] or
                db_category != excel_item["category"]):
                # Need update
                update_item = excel_item.copy()
                update_item["id"] = db_item["id"]
                to_update.append(update_item)

    # Find items to delete (in DB but not in Excel)
    for db_item in db_items:
        if db_item["name"] not in excel_lookup:
            to_delete.append(db_item["id"])

    print(f"📊 Diff Summary:")
    print(f"   - INSERT: {len(to_insert)} items")
    print(f"   - UPDATE: {len(to_update)} items")
    print(f"   - DELETE: {len(to_delete)} items")

    return to_insert, to_update, to_delete

def execute_sync(supabase: Client, to_insert: List[Dict], to_update: List[Dict], to_delete: List[int]):
    """Execute the sync operations"""
    print("\n🚀 Executing sync operations...")

    success_count = {"insert": 0, "update": 0, "delete": 0}

    # INSERT new items
    if to_insert:
        print(f"\n➕ Inserting {len(to_insert)} new items:")
        for item in to_insert:
            try:
                supabase.table("menu_items").insert({
                    "name": item["name"],
                    "price": item["price"],
                    "category": item["category"],
                    "is_available": True
                }).execute()
                print(f"   ✅ {item['name']} - {item['price']:,}đ ({item['category']})")
                success_count["insert"] += 1
            except Exception as e:
                print(f"   ❌ Failed to insert {item['name']}: {e}")

    # UPDATE existing items
    if to_update:
        print(f"\n🔄 Updating {len(to_update)} items:")
        for item in to_update:
            try:
                supabase.table("menu_items").update({
                    "price": item["price"],
                    "category": item["category"]
                }).eq("id", item["id"]).execute()
                print(f"   ✅ {item['name']} - {item['price']:,}đ ({item['category']})")
                success_count["update"] += 1
            except Exception as e:
                print(f"   ❌ Failed to update {item['name']}: {e}")

    # DELETE removed items
    if to_delete:
        print(f"\n🗑️  Deleting {len(to_delete)} items:")
        for item_id in to_delete:
            try:
                supabase.table("menu_items").delete().eq("id", item_id).execute()
                print(f"   ✅ Deleted ID: {item_id}")
                success_count["delete"] += 1
            except Exception as e:
                print(f"   ❌ Failed to delete ID {item_id}: {e}")

    print(f"\n✅ Sync completed!")
    print(f"   - Inserted: {success_count['insert']}/{len(to_insert)}")
    print(f"   - Updated: {success_count['update']}/{len(to_update)}")
    print(f"   - Deleted: {success_count['delete']}/{len(to_delete)}")

def verify_sync(supabase: Client, expected_count: int = 58):
    """Verify sync results"""
    print(f"\n🔍 Verifying sync (expecting {expected_count} items)...")

    current_items = fetch_current_menu(supabase)

    if len(current_items) == expected_count:
        print(f"✅ SUCCESS: Database has exactly {expected_count} items")

        # Group by category
        category_counts = {}
        for item in current_items:
            cat = item["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1

        print("\n📊 Category breakdown:")
        for cat, count in sorted(category_counts.items()):
            print(f"   - {cat}: {count} items")

        return True
    else:
        print(f"❌ ERROR: Database has {len(current_items)} items, expected {expected_count}")
        return False

def main():
    """Main execution flow"""
    print("=" * 60)
    print("🍽️  MENU SYNC SCRIPT - Cơm Ánh Dương")
    print("=" * 60)

    # Step 1: Load Excel
    excel_file = "menu mau (2).xlsx"
    excel_items = load_excel_menu(excel_file)

    # Step 2: Connect to Supabase
    supabase = get_supabase_client()

    # Step 3: Fetch current menu
    db_items = fetch_current_menu(supabase)

    # Step 4: Calculate diff
    to_insert, to_update, to_delete = calculate_diff(excel_items, db_items)

    # Step 5: Confirm before execution
    if to_insert or to_update or to_delete:
        print("\n⚠️  Ready to sync. Changes:")
        print(f"   - INSERT: {len(to_insert)}")
        print(f"   - UPDATE: {len(to_update)}")
        print(f"   - DELETE: {len(to_delete)}")

        response = input("\nProceed with sync? (yes/no): ")
        if response.lower() != "yes":
            print("❌ Sync cancelled")
            return

        # Step 6: Execute sync
        execute_sync(supabase, to_insert, to_update, to_delete)

        # Step 7: Verify
        verify_sync(supabase, expected_count=len(excel_items))
    else:
        print("\n✅ No changes needed - database already in sync!")
        verify_sync(supabase, expected_count=len(excel_items))

if __name__ == "__main__":
    main()
