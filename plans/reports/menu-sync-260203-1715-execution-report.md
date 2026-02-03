# Menu Sync Execution Report
**Date:** 2026-02-03 17:15
**Task:** Sync 58 menu items from Excel to Supabase

---

## Status: PARTIAL SUCCESS ⚠️

### Completed ✅
1. **Cafe/Drink Items Restored**: 90 items (IDs 1-90) are intact
2. **54 Food Items Updated**: Prices synced correctly
3. **Script Created**: `scripts/manual-menu-fix.sql` for final fixes

### Remaining Work ❌

#### Issue: RLS (Row Level Security) Blocking Operations

**Cannot Delete (12 items):**
- ID=97: Sườn + trứng chiên (duplicate, wrong name)
- ID=107: Cá cơm kho lạt (xoài bằm) (duplicate, wrong name)
- ID=113: Cá he kho mềm xương (duplicate, wrong name)
- ID=132: Tép gạo ram mặn (duplicate, wrong name)
- ID=149-156: 8 Combo items (should not be in food menu)

**Cannot Insert (4 items):**
- Sườn + trứng - chiên (30,000đ)
- Cá cơm - mồm kho lạt (xoài bằm) (30,000đ)
- **Cá he kho - mềm xương (450,000đ)** ⚠️ CRITICAL PRICE
- Tép gạo ram mặm (35,000đ)

---

## Solution: Manual SQL Execution Required

### Option 1: Supabase Dashboard (Recommended)

1. Go to: https://rnhtfaxqnvikedwufvcd.supabase.co/project/_/sql
2. Execute script: `scripts/manual-menu-fix.sql`
3. Verify: Should show 58 food items

### Option 2: Get Service Role Key

If available, use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS in Python script.

---

## Current Database State

| Category | Count | Status |
|----------|-------|--------|
| Drinks/Cafe (ID < 91) | 90 | ✅ Good |
| Food Menu (ID >= 91) | 66 | ❌ Should be 58 |
| **Total** | **156** | ⚠️ Need -8 |

---

## Critical Item Verification

**Cá he kho - mềm xương:**
- Current: ID=113, name="Cá he kho mềm xương" (wrong name, exists but duplicated)
- Needed: name="Cá he kho - mềm xương" (correct name with dashes), price=450,000đ

---

## Files Created

1. `scripts/sync-menu-v2.py` - Main sync script
2. `scripts/complete-menu-fix.py` - Comprehensive fix
3. `scripts/manual-menu-fix.sql` - **USE THIS** in Supabase SQL Editor
4. `scripts/run-menu-sync.sh` - Auto-runner

---

## Next Steps

1. **URGENT**: Execute `scripts/manual-menu-fix.sql` in Supabase Dashboard
2. Verify count: `SELECT COUNT(*) FROM menu_items WHERE id >= 91;` = 58
3. Verify critical price: `SELECT price FROM menu_items WHERE name = 'Cá he kho - mềm xương';` = 450000

---

## Why RLS Blocked Us

The `menu_items` table has Row Level Security policies that require:
- Service role authentication for INSERT/DELETE operations
- Or specific user permissions we don't have with `anon` key

**Resolution**: Use SQL Editor (bypasses RLS) or get service_role key from project settings.
