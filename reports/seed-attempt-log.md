# Seed Script Execution Report
**Date:** 2026-02-07
**Script:** `scripts/seed-full-menu.mjs`
**Status:** ❌ Failed

## Execution Summary
The seed script was executed to populate the `menu_items` and `categories` tables. The script parses the data from `sql/seed-full-menu.sql` and attempts to upsert it into Supabase.

- **Total Items Parsed:** 110
- **Successful Upserts:** 0
- **Failed Upserts:** 110

## Error Details
The operation failed due to **Row Level Security (RLS)** policies.
```
Error: new row violates row-level security policy for table "menu_items"
Error: new row violates row-level security policy for table "categories"
```

## Root Cause
1. The script attempted to authenticate as `admin@anhduong.com`. Authentication was successful.
2. However, the configured RLS policies on Supabase prevent `INSERT`/`UPDATE` operations even for this authenticated user (or specifically for the `menu_items` table).
3. The script contains logic to bypass RLS using the `SUPABASE_SERVICE_ROLE_KEY`, but this key is **missing** from the `.env` file.

## Recommendations
To successfully seed the database, choose one of the following options:

### Option 1: Provide Service Role Key (Recommended for Scripting)
Add the Service Role Key to your `.env` file. This key has superuser privileges and bypasses RLS.
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
Then run the script again:
```bash
node scripts/seed-full-menu.mjs
```

### Option 2: Run SQL Directly
Copy the contents of `sql/seed-full-menu.sql` and execute it directly in the Supabase Dashboard SQL Editor. This script includes `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` commands which will handle the permissions issue temporarily.
