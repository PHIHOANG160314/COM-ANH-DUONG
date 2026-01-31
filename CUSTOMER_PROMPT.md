# Supabase Setup Guide - Cơm Ánh Dương

Welcome! This guide will help you set up Supabase and connect it to your website at comanhduong.com.

## Quick Overview

| Step                       | Time  | Location            |
| -------------------------- | ----- | ------------------- |
| 1. Create Supabase Project | 5 min | Supabase Dashboard  |
| 2. Run Migrations          | 3 min | Supabase SQL Editor |
| 3. Add Demo Data           | 2 min | Supabase SQL Editor |
| 4. Configure Vercel        | 2 min | Vercel Dashboard    |
| 5. Redeploy & Verify       | 3 min | Vercel + Website    |

**Total time: ~15 minutes**

---

## Step 1: Create Supabase Project

1. Go to **[supabase.com](https://supabase.com)** → Click **Start your project**
2. Sign in with GitHub or email
3. Click **New project**
4. Fill in:
   - **Name**: `com-anh-duong`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: `Southeast Asia (Singapore)` ← closest to Vietnam
5. Click **Create new project**
6. Wait 1-2 minutes for setup to complete

---

## Step 2: Run Database Migrations

You need to run 3 SQL files in order. Each file sets up part of the database.

### 2.1 Get the Migration Files

The files are in your project at:

```
react-app/supabase/migrations/
├── 20260131_initial_schema.sql    (1st - core tables)
├── 20260131_rls_policies.sql      (2nd - security)
└── 20260614_products_schema.sql   (3rd - products table)
```

### 2.2 Run Each Migration

1. In Supabase Dashboard → **SQL Editor** (left sidebar, looks like ⌘ icon)
2. Click **New query**
3. **Copy the entire contents** of `20260131_initial_schema.sql`
4. **Paste** into the SQL Editor
5. Click **Run** (green button)
6. Look for ✓ "Success" message
7. **Repeat** for the other two files in order

> ⚠️ **Important**: Run them in order! The second file depends on the first.

---

## Step 3: Add Demo Menu Data

1. Still in **SQL Editor**, click **New query**
2. Copy contents of `react-app/supabase/seed_products.sql`
3. Paste and click **Run**
4. Verify: Go to **Table Editor** → click `products` → you should see ~18 menu items

---

## Step 4: Get Your Credentials

1. In Supabase Dashboard → **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI...` (long string)

> 💡 Keep these in a notepad - you'll paste them in Vercel next.

---

## Step 5: Configure Vercel

1. Go to **[vercel.com](https://vercel.com)** → Sign in
2. Select the **COM-ANH-DUONG** project
3. Go to **Settings** → **Environment Variables**
4. Add two variables:

| Name                     | Value                            |
| ------------------------ | -------------------------------- |
| `VITE_SUPABASE_URL`      | Your Project URL from Step 4     |
| `VITE_SUPABASE_ANON_KEY` | Your anon public key from Step 4 |

5. Click **Save** for each

---

## Step 6: Redeploy

1. In Vercel, go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** menu → **Redeploy**
4. Check "Use existing Build Cache" → Click **Redeploy**
5. Wait ~2 minutes for deployment

---

## Step 7: Verify

1. Go to **https://comanhduong.com/menu**
2. Open browser DevTools (press F12)
3. Check the **Console** tab

### ✅ Success looks like:

- Menu items load with images
- No red errors in console
- No "demo mode" warnings

### ❌ If you see errors:

- **401 Unauthorized**: Double-check your Supabase URL and key in Vercel
- **No data showing**: Verify the seed data was inserted (check Table Editor)

---

## Need Help?

If something isn't working:

1. Take a screenshot of any error messages
2. Check which step you were on
3. Contact support with the screenshot and step number

Good luck! 🍚🍲
