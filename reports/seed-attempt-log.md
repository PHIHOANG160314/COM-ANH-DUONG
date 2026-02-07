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

## Root Cause Analysis
1. **Missing Service Role Key**: The script defaults to using the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS, but this key is missing from `.env` and `.env.local`.
2. **Authentication Fallback Failed**: The script attempted to fallback to using the authenticated `admin@anhduong.com` user.
3. **Missing Admin Profile**: A diagnostic check (`scripts/check-admin-profile.mjs`) revealed that while the `admin@anhduong.com` user exists in Auth, there is **no corresponding record** in the `public.profiles` table.
   - The RLS policies rely on `public.profiles.role` being 'admin' to grant write access.
   - Since the profile is missing, the user effectively has no role (or default 'customer' access), preventing them from writing to `menu_items`.

## Action Plan
To successfully seed the database, you must perform **one** of the following actions:

### Option A: Run SQL in Dashboard (Recommended)
This is the fastest method and bypasses all local configuration issues.
1. Open the [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/_/sql/new).
2. Copy the content of `sql/seed-full-menu.sql`.
3. Paste and Run.
4. **Also Run This Fix** (to ensure Admin works later):
   ```sql
   -- Fix Admin Profile
   INSERT INTO public.profiles (id, email, role, full_name)
   SELECT id, email, 'admin', 'Admin User'
   FROM auth.users
   WHERE email = 'admin@anhduong.com'
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```

### Option B: Add Service Role Key
If you want to run scripts locally:
1. Go to Supabase Dashboard > Project Settings > API.
2. Copy the `service_role` secret.
3. Add it to your `.env` file:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. Run the seed script:
   ```bash
   node scripts/seed-full-menu.mjs
   ```
