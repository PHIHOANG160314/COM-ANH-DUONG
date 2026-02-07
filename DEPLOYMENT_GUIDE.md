# Deployment Guide - Cơm Ánh Dương POS System

This guide provides step-by-step instructions for deploying the Cơm Ánh Dương restaurant POS system.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development](#local-development)
4. [Deploy to Vercel](#deploy-to-vercel)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- A Supabase account (free tier is sufficient)
- A Vercel account (free tier is sufficient)
- GitHub account (for repository hosting)

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: `com-anh-duong` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., Southeast Asia)
   - **Plan**: Free tier is sufficient for getting started
4. Click "Create new project"
5. Wait 2-3 minutes for project initialization

### Step 2: Get API Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API Key** (anon, public): `eyJhbGci...` (long string)

### Step 3: Run Database Migrations

1. Open **SQL Editor** in Supabase dashboard
2. Click "New query"
3. Copy and paste the contents of `supabase/migrations/20260131_initial_schema.sql`
4. Click "Run" button
5. Repeat for other migration files in order:
   - `20260131_rls_policies.sql`
   - `20260131_create_payment_transactions.sql` (if using VNPay/MoMo)

### Step 4: Seed Database (Optional)

1. In SQL Editor, create a new query
2. Copy and paste contents of `supabase/seed.sql`
3. Click "Run" to populate with sample data

---

## Local Development

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/com-anh-duong-10x.git
cd com-anh-duong-10x/react-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace placeholders with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

### Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Test the application:**
- Navigate to Customer Ordering page
- Add items to cart
- Test checkout with COD payment
- Check Kitchen Display System
- Test Staff POS

---

## Deploy to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository (`com-anh-duong-10x`)
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `react-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | From Supabase Settings → API |

Select **Production**, **Preview**, and **Development** for each variable.

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a live URL: `https://your-project.vercel.app`

---

## Post-Deployment

### Verify Deployment

**Critical Tests:**
1. ✅ **Homepage loads** - Navigate to your Vercel URL
2. ✅ **Customer ordering works** - Add items to cart, proceed to checkout
3. ✅ **COD payment** - Place order with "Tiền mặt khi nhận hàng"
4. ✅ **Kitchen display updates** - Check order appears in Kitchen Display System
5. ✅ **Staff POS** - Login as staff, view orders
6. ✅ **Database connection** - Verify menu items load from Supabase

### Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `order.comanhduong.vn`)
3. Follow DNS configuration instructions from Vercel
4. Wait for DNS propagation (5-60 minutes)

### SSL Certificate

Vercel automatically provisions SSL certificates for all domains. No action needed.

---

## Troubleshooting

### Issue: "Supabase client error" or blank page

**Solution:**
1. Verify `.env` variables are correct in Vercel
2. Check Supabase project is active (not paused)
3. Confirm RLS policies are configured (see migrations)
4. Check browser console for detailed errors

### Issue: "404 Not Found" on page refresh

**Solution:**
Ensure `vercel.json` exists with SPA rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Redeploy after adding.

### Issue: Menu items don't load

**Solution:**
1. Check Supabase migrations ran successfully
2. Verify `menu_items` table exists and has data
3. Run seed script if database is empty
4. Check RLS policies allow public read access

### Issue: Orders not saving

**Solution:**
1. Check `orders` table RLS policies
2. Verify authentication is working
3. Check browser console for error details
4. Test with anonymous access first

### Issue: Build fails on Vercel

**Solution:**
1. Verify `package.json` has all dependencies
2. Check Node.js version compatibility (use 18+)
3. Run `npm run build` locally to reproduce
4. Check Vercel build logs for specific errors

---

## Payment Gateway Integration (Optional)

For VNPay/MoMo payment integration, see:
- `PAYMENT_DEPLOYMENT.md` - Payment gateway setup guide
- `docs/payment-integration.md` - Technical implementation details

**Note:** COD (Cash on Delivery) is enabled by default and requires no additional setup.

---

## Support

If you encounter issues not covered here:
1. Check the project's `README.md`
2. Review `DATABASE_SCHEMA.md` for database structure
3. Inspect browser console and network tab
4. Check Supabase logs in dashboard
5. Review Vercel deployment logs

---

**Last Updated:** 2026-01-31
