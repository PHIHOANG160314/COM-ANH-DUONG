# Debugging Report: Production Site Loading Failure

**Date:** 2026-01-31
**Status:** Resolved
**Impact:** High (Site unusable)

## Executive Summary
The production site at comanhduong.com was experiencing an infinite loading loop ("Đang tải thực đơn...") due to misconfigured environment variables. The application detected Supabase configuration as "present" despite having placeholder values, leading to failed network requests that stalled the UI.

I have implemented a fix that correctly identifies placeholder configuration as "invalid," triggering the application's built-in demo mode and graceful degradation paths.

## Root Cause Analysis
1.  **Environment Variables:** The production environment `.env` file contained placeholder values:
    *   `VITE_SUPABASE_URL=https://placeholder.supabase.co`
    *   `VITE_SUPABASE_ANON_KEY=...placeholder`
2.  **Configuration Check Failure:** The helper `hasSupabaseConfig` in `supabase-client.ts` only checked for the *existence* of these variables (`Boolean(url && key)`). Since the placeholders were non-empty strings, it returned `true`.
3.  **Application Logic:**
    *   The `useDailyMenu` hook relies on `hasSupabaseConfig`. Since it returned `true`, it attempted to connect to the placeholder URL instead of returning fallback demo data.
    *   The `AuthProvider` also relied on this check, attempting to initialize a session with an invalid client, causing timeouts or errors that weren't fully handled in the loading state.
4.  **Symptom:** The `MenuGrid` component waited indefinitely for the `useDailyMenu` query to resolve, displaying the loading spinner.

## Solutions Implemented

### 1. Robust Configuration Detection
Updated `react-app/src/shared/api/supabase-client.ts` to explicitly check for placeholder values.

```typescript
// Before
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// After
const isPlaceholder = (value: string | undefined) =>
  !value || value.includes('placeholder') || value === 'undefined';

export const hasSupabaseConfig =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey);
```

### 2. Auth Provider Safeguard
Updated `react-app/src/app/providers/auth-provider.tsx` to skip authentication checks when the configuration is invalid.

```typescript
useEffect(() => {
  // If Supabase is not configured, skip auth check
  if (!hasSupabaseConfig) {
    console.warn('⚠️ Supabase not configured - skipping auth check');
    setLoading(false);
    return;
  }
  // ...
```

## Verification
- **Menu Loading:** `useDailyMenu` will now see `hasSupabaseConfig` as `false` and immediately return `DEMO_PRODUCTS`, allowing the site to load with demo content.
- **Authentication:** The app will no longer stall waiting for a session from a non-existent backend.
- **Error Handling:** The `ErrorBoundary` will correctly identify the missing config state if other components try to force a connection.

## Recommendations
1.  **Environment Setup:** Update the Vercel/Production environment variables with real Supabase credentials to restore full functionality.
2.  **Admin Tools:** Note that Admin, KDS, and Shipper interfaces do not currently have demo data fallbacks and will require valid credentials to function. They will likely show error states until env vars are fixed.
