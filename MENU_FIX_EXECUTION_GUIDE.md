# Menu Fix Execution Guide

## Goal
Execute `scripts/manual-menu-fix.sql` to:
- Delete 12 extra/duplicate menu items
- Insert 4 missing items with correct names
- Achieve exactly 58 food items (IDs 91+)

## SQL Script Overview
The script performs:
1. **DELETE** 12 items (IDs: 97, 107, 113, 132, 149-156)
2. **INSERT** 4 corrected items:
   - Sườn + trứng - chiên (30k)
   - Cá cơm - mồm kho lạt (xoài bằm) (30k)
   - Cá he kho - mềm xương (45k) ⚠️ **CRITICAL: Should be 450k**
   - Tép gạo ram mặm (35k)
3. **VERIFY** final count = 58

## ⚠️ CRITICAL ISSUE DETECTED

**Line 26 of SQL script has WRONG PRICE:**
```sql
('Cá he kho - mềm xương', 45000, 'rice', true),  -- ❌ WRONG: 45k
```

**Should be:**
```sql
('Cá he kho - mềm xương', 450000, 'rice', true),  -- ✅ CORRECT: 450k
```

## Execution Options

### Option 1: Supabase SQL Editor (RECOMMENDED - Bypasses RLS)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create new query
4. Copy contents of `scripts/manual-menu-fix.sql`
5. **FIX LINE 26** - Change `45000` to `450000`
6. Execute query
7. Verify results (should show 58 items, 450k price)

### Option 2: psql with Service Role Key

If you have the service role key:

```bash
# Set environment variables
export SUPABASE_URL="https://rnhtfaxqnvikedwufvcd.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# Execute SQL
psql "postgresql://postgres:[SERVICE_ROLE_KEY]@db.rnhtfaxqnvikedwufvcd.supabase.co:5432/postgres" \
  -f scripts/manual-menu-fix.sql
```

### Option 3: Supabase CLI with Database URL

```bash
# Get database URL from Supabase Dashboard → Settings → Database
psql "your_direct_database_url_here" -f scripts/manual-menu-fix.sql
```

## Post-Execution Verification

Run these queries in SQL Editor:

```sql
-- 1. Check total food items (should be 58)
SELECT COUNT(*) as total_food_items
FROM menu_items
WHERE id >= 91;

-- 2. Verify the 450k item exists
SELECT id, name, price
FROM menu_items
WHERE name = 'Cá he kho - mềm xương';
-- Expected: price = 450000

-- 3. Check for duplicates (should return 0)
SELECT name, COUNT(*) as count
FROM menu_items
WHERE id >= 91
GROUP BY name
HAVING COUNT(*) > 1;

-- 4. List all 58 items
SELECT id, name, price, category_id
FROM menu_items
WHERE id >= 91
ORDER BY id;
```

## Next Steps

After successful execution:
1. Verify frontend displays all 58 items correctly
2. Check that "Cá he kho - mềm xương" shows 450,000₫
3. Test order flow with the corrected menu
4. Update `docs/project-changelog.md` with this fix

## Security Note

⚠️ **RLS Bypass Required**: This SQL must be run with admin/service role privileges because Row Level Security (RLS) is enabled on `menu_items` table. The anon key in `.env.production` will NOT work for direct SQL execution.
