# Login Issue Debug Report
**Date**: 2026-02-01
**Issue**: "Invalid API Key" error on login
**Test Account**: anhduongfood01@gmail.com

---

## Root Cause Analysis

### 1. Supabase Configuration Status: ❌ PLACEHOLDER MODE

**Current .env configuration**:
```bash
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...placeholder
```

**Detection Logic** (src/shared/api/supabase-client.ts:8-14):
```typescript
const isPlaceholder = (value: string | undefined) =>
  !value || value.includes('placeholder') || value === 'undefined';

export const hasSupabaseConfig =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey);
```

**Result**: `hasSupabaseConfig = false`

---

## Why "Invalid API Key" Error Appears

### Error Flow:

1. **User enters credentials** → anhduongfood01@gmail.com / ad123%&Ad

2. **LoginForm.tsx:36-39** calls Supabase auth:
```typescript
const { error: authError } = await supabase.auth.signInWithPassword({
  email: data.email,
  password: data.password,
});
```

3. **Supabase client** (created with placeholder values) sends request to:
   - URL: `https://placeholder.supabase.co/auth/v1/token`
   - API Key: `eyJhbGciOiJIUzI1...placeholder`

4. **Supabase API response**:
   - Status: 400 Bad Request
   - Error: "Invalid API key" or similar authentication error
   - Reason: Placeholder URL doesn't exist, placeholder key is invalid

5. **LoginForm.tsx:45-48** catches error and displays:
```typescript
const message = err instanceof Error
  ? err.message  // "Invalid API key" from Supabase
  : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
setError(message);
```

---

## Current System Behavior

### Authentication Flow:
- ✅ **App loads**: AuthProvider skips auth check (line 28-32)
- ✅ **Public pages work**: Menu, Cart, Checkout (no auth required)
- ❌ **Login fails**: Invalid API key error
- ❌ **Protected routes**: Would fail if accessed
- ⚠️ **Admin navigation**: `/admin` route exists but can't authenticate

### Demo Mode Detection:
The app detects placeholder mode and logs warnings:
```
Debug.warn('Missing Supabase environment variables - using demo mode')
Debug.warn('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real data')
```

---

## What's Working vs. What's Not

### ✅ Working (No Auth Required):
- Homepage (/)
- Menu (/menu)
- Product browsing
- Cart functionality (local state)
- Checkout page (UI only, no backend)
- PWA features (offline, install)

### ❌ Not Working (Requires Real Supabase):
- Login (/login)
- Register (/register)
- Authentication
- User profiles
- Order history
- Admin dashboard (/admin/*)
- Kitchen Display (/kitchen)
- Staff POS (/staff/pos)
- Database operations (products, orders, users)

---

## Admin Navigation Status

**Route Definition** (src/app/router/router.tsx):
```typescript
const AdminLayout = lazy(() =>
  import('@/pages/admin/admin-layout').then((m) => ({ default: m.AdminLayout }))
);
```

**Files Present**:
- `src/pages/admin/admin-dashboard-page.tsx` (2.9KB)
- `src/pages/admin/admin-menu-page.tsx` (329B)

**Status**: ⚠️ **Routes exist but inaccessible**
- Admin pages are code-split and lazy-loaded
- Navigation would work IF user was authenticated
- Currently fails because no valid Supabase session

---

## Fix Required: Real Supabase Configuration

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project (or use existing)
3. Note down:
   - **Project URL**: Settings → API → Project URL
   - **Anon/Public Key**: Settings → API → Project API keys → anon public

### Step 2: Update .env

Replace placeholder values in `.env`:

```bash
# Supabase Configuration (REAL VALUES)
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_REAL_KEY
```

### Step 3: Database Setup

Create required tables in Supabase:

```sql
-- Users/Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL,
  total DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 4: Create Test User

In Supabase Dashboard → Authentication → Users:
1. Add user: anhduongfood01@gmail.com
2. Set password: ad123%&Ad
3. Confirm email (or disable email confirmation in Auth settings)

### Step 5: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

The app will detect real Supabase config and enable authentication.

---

## Alternative: Demo/Mock Mode

If you want to test without Supabase, you need to:

1. **Create mock authentication**:
   - Mock `supabase.auth.signInWithPassword()`
   - Return fake session/user
   - Store in localStorage

2. **Update AuthProvider**:
   - Add demo user when `!hasSupabaseConfig`
   - Skip real Supabase calls

**Not recommended** - better to use real Supabase (free tier available).

---

## Verification Steps

Once Supabase is configured:

1. **Check console logs**:
```bash
# Should NOT see these warnings:
# ⚠️ Missing Supabase environment variables - using demo mode
# ⚠️ Supabase not configured - skipping auth check
```

2. **Test login**:
   - Go to /login
   - Enter: anhduongfood01@gmail.com / ad123%&Ad
   - Should redirect to / with authenticated session

3. **Check auth state**:
```typescript
// In browser console
localStorage.getItem('sb-YOUR_PROJECT_ID-auth-token')
// Should return JWT token
```

4. **Test admin access**:
   - Navigate to /admin
   - Should show admin dashboard (if user role is 'admin')

---

## Current System Status

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Config | ❌ Placeholder | .env has demo values |
| hasSupabaseConfig | ❌ false | Detected as placeholder |
| Login | ❌ Fails | "Invalid API key" error |
| Public Routes | ✅ Works | No auth required |
| Admin Routes | ⚠️ Inaccessible | Code exists, needs auth |
| Database | ❌ No connection | Placeholder URL |

---

## Summary

**Why login fails**:
- .env contains placeholder Supabase credentials
- App tries to authenticate against non-existent `https://placeholder.supabase.co`
- Supabase API returns "Invalid API key" error

**What's needed**:
1. Create real Supabase project (free tier: https://supabase.com)
2. Get Project URL and Anon Key from Settings → API
3. Update .env with real values
4. Set up database tables (profiles, products, orders)
5. Create test user in Supabase Auth
6. Restart dev server

**Admin navigation**:
- Admin pages exist and are code-split
- Routes are configured in router
- Currently inaccessible without authentication
- Will work once Supabase is properly configured

---

## Quick Start Commands

```bash
# 1. Check current config
cat .env

# 2. After updating .env with real Supabase values:
npm run dev

# 3. Test login
# Open: http://localhost:5173/login
# Email: anhduongfood01@gmail.com
# Password: ad123%&Ad

# 4. Check auth in console
# Browser DevTools → Console:
localStorage.getItem('supabase.auth.token')
```

---

## Files Referenced

- `.env` - Environment variables (placeholder values)
- `.env.example` - Template with real variable names
- `src/shared/api/supabase-client.ts` - Supabase client setup
- `src/app/providers/auth-provider.tsx` - Authentication provider
- `src/features/auth/login-form.tsx` - Login form component
- `src/pages/admin/*` - Admin pages (exist but need auth)

---

## Unresolved Questions

1. Should we implement mock/demo authentication for development without Supabase?
2. What should be the default user role when creating new accounts?
3. Should we show a different error message when Supabase is not configured (instead of "Invalid API key")?
4. Do we need a setup wizard or documentation page for first-time Supabase configuration?
