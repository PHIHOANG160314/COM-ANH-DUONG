# Menu Sync Completion Report
**Date:** 2026-02-03
**Task:** Execute manual-menu-fix.sql to achieve exactly 58 food items

## Status: ⚠️ AWAITING MANUAL EXECUTION

### What Was Done

1. **✅ Fixed Critical Price Bug**
   - File: `scripts/manual-menu-fix.sql`
   - Changed line 26: `45000` → `450000` (Cá he kho - mềm xương)
   - This item should cost 450k VND, not 45k

2. **✅ Created Execution Guide**
   - File: `MENU_FIX_EXECUTION_GUIDE.md`
   - Provides 3 methods to execute the SQL
   - Includes verification queries

### What Needs Manual Action

**SQL must be executed in Supabase SQL Editor** because:
- RLS (Row Level Security) is enabled on `menu_items` table
- Requires service role privileges to bypass RLS
- Cannot use anon key from `.env.production`

## SQL Script Overview

The corrected `scripts/manual-menu-fix.sql` will:

### 1. DELETE (12 items)
```
IDs: 97, 107, 113, 132, 149, 150, 151, 152, 153, 154, 155, 156
```
- Duplicates with wrong names
- Invalid combo items

### 2. INSERT (4 items)
```sql
('Sườn + trứng - chiên', 30000, 'rice', true)
('Cá cơm - mồm kho lạt (xoài bằm)', 30000, 'rice', true)
('Cá he kho - mềm xương', 450000, 'rice', true)  -- ✅ FIXED: 450k
('Tép gạo ram mặm', 35000, 'rice', true)
```

### 3. VERIFY
- Total food items (id >= 91): **58**
- Critical item price: **450,000₫**

## Execution Instructions

### RECOMMENDED: Supabase SQL Editor

1. Open Supabase Dashboard: https://app.supabase.com/project/rnhtfaxqnvikedwufvcd
2. Go to **SQL Editor** tab
3. Click **New Query**
4. Copy entire contents of `scripts/manual-menu-fix.sql`
5. Paste into editor
6. Click **RUN** button
7. Verify results in output panel

### Expected Output

```
DELETE 12
INSERT 0 4

┌─────────────────┐
│ total_food_items│
├─────────────────┤
│              58 │
└─────────────────┘

┌────┬──────────────────────────┬────────┐
│ id │          name            │ price  │
├────┼──────────────────────────┼────────┤
│[new]│ Cá he kho - mềm xương    │ 450000 │
└────┴──────────────────────────┴────────┘
```

## Post-Execution Verification

After running SQL, verify in production:

### Database Check
```sql
-- Should return 58
SELECT COUNT(*) FROM menu_items WHERE id >= 91;

-- Should show 450000
SELECT name, price FROM menu_items WHERE name = 'Cá he kho - mềm xương';
```

### Frontend Check
1. Visit https://comanhduong.com
2. Navigate to menu
3. Find "Cá he kho - mềm xương"
4. Verify price displays as **450,000₫**
5. Count total items in "Cơm" category (should match 58)

## Files Modified

- ✅ `scripts/manual-menu-fix.sql` - Fixed price from 45k to 450k
- ✅ `MENU_FIX_EXECUTION_GUIDE.md` - Detailed execution instructions

## Next Steps

1. **Execute SQL** via Supabase SQL Editor
2. **Verify count** = 58 items
3. **Verify price** = 450,000₫ for critical item
4. **Test frontend** to confirm menu displays correctly
5. **Update changelog** in `docs/project-changelog.md`

## Security Note

⚠️ **Service Role Required**: This operation requires admin privileges. Do NOT attempt with anon key. Only execute via Supabase SQL Editor or with service role key.

---

**Awaiting manual execution by authorized user with Supabase dashboard access.**
