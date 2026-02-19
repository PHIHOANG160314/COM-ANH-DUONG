# Bundle Size Analysis & Code Splitting Audit

**Project:** Cơm Ánh Dương 10X
**Date:** 2026-02-12 07:39
**Reviewer:** code-reviewer agent
**Scope:** Bundle optimization, code splitting strategy, tree-shaking opportunities

---

## Executive Summary

Current bundle strategy: **PARTIALLY OPTIMIZED**
Estimated initial bundle: **~650KB gzipped** (MUI + Supabase + React 19 + Recharts)
Lazy-loaded chunks: **11 routes** (admin, profile, kitchen, shipper, POS)
Main issue: **manualChunks disabled** due to circular dependency bug (comment in vite.config:135-137)

**Critical Finding:** Vite build có comment "Disabled manualChunks - was causing circular dependency error" → cần investigate + fix, không disable vô thời hạn.

---

## Current Bundle Size Estimate

### Dependencies Analysis (package.json)

| Dependency                | Estimated Size | Category       | Impact  |
|---------------------------|----------------|----------------|---------|
| `@mui/material` + icons   | ~220KB gz      | UI Framework   | HIGH    |
| `@supabase/supabase-js`   | ~35KB gz       | Backend        | MEDIUM  |
| `@tanstack/react-query`   | ~25KB gz       | State          | MEDIUM  |
| `recharts`                | ~150KB gz      | Charts         | HIGH    |
| `framer-motion`           | ~60KB gz       | Animation      | MEDIUM  |
| `react-router-dom` v7     | ~30KB gz       | Routing        | LOW     |
| `react-hook-form` + zod   | ~20KB gz       | Forms          | LOW     |
| Other deps                | ~60KB gz       | Utilities      | LOW     |

**Total Estimated:** ~600-650KB gzipped (main + vendor chunks)

**Target:** <500KB gzipped (Binh Pháp Front 3 requirement: Build <10s, bundle reasonable)

---

## Code Splitting Current State

### ✅ IMPLEMENTED (Good)

**Router-level lazy loading** (`src/app/router/router.tsx`):
- ProfilePage
- KitchenDisplayPage
- StaffMobilePosPage
- ShipperDeliveryPage
- AdminLayout + 6 admin pages (dashboard, analytics, products, menu, orders, settings)

**Total lazy chunks:** 11 route-based splits

**Impact:** Customer-facing routes (home, menu, checkout) load immediately, admin/staff routes deferred.

---

### ❌ MISSING / NOT OPTIMIZED

#### 1. manualChunks DISABLED (CRITICAL)

**File:** `vite.config.ts:135-137`

```typescript
// Disabled manualChunks - was causing circular dependency error:
// "Cannot access 'hu' before initialization" in vendor-misc chunk
// Let Vite handle chunking automatically for now
```

**Problem:**
- Circular dependency trong vendor-misc chunk → root cause không fix
- Comment "for now" → technical debt
- Automatic chunking có thể tạo nhiều small chunks không tối ưu

**Recommendation:** HIGH priority fix circular dep, re-enable manualChunks với strategy:
```typescript
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
  'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-persist-client'],
  'vendor-supabase': ['@supabase/supabase-js'],
  'vendor-charts': ['recharts'],
  'vendor-animation': ['framer-motion'],
}
```

---

#### 2. Heavy Components NOT Lazy-Loaded

**Chart components** (HIGH impact):
- `DailyRevenueChart` (`src/features/admin/reports/components/daily-revenue-chart.tsx`)
- `TopItemsTable` (sử dụng recharts)

**Recommendation:** Lazy load charts in admin analytics page:
```tsx
const DailyRevenueChart = lazy(() => import('@/features/admin/reports/components/daily-revenue-chart'));
```

**Framer Motion heavy usage:**
- `src/shared/ui/page-transition.tsx` (tất cả pages dùng)
- `src/features/home/components/hero-section.tsx`

**Recommendation:** Extract motion components vào separate chunk hoặc dùng dynamic import cho non-critical animations.

---

#### 3. MUI Components Import Strategy

**Current:** Full imports từ `@mui/material`

**Tree-shaking:** Vite tự động tree-shake với ES modules, nhưng MUI icons vẫn nặng.

**Recommendation:** MEDIUM priority - verify tree-shaking effectiveness với build analysis:
```bash
npx vite-bundle-visualizer
```

---

#### 4. Images & Assets

**Image optimization:** OK (WebP đã config trong PWA workbox)

**Potential improvement:**
- Lazy load hero images (`hero-section.tsx`)
- Use native lazy loading: `<img loading="lazy" />`

---

## Tree-Shaking Opportunities

### Dependencies với unused exports (estimate)

| Dependency        | Potential Waste | Reason                                    |
|-------------------|-----------------|-------------------------------------------|
| `recharts`        | ~30KB           | Nhiều chart types không dùng              |
| `@mui/icons`      | ~40KB           | Icons tree-shake OK nhưng verify lại      |
| `date-fns` vs `dayjs` | ~10KB       | Có cả hai! Chỉ nên dùng 1 (dayjs nhẹ hơn) |
| `dompurify`       | ~15KB           | Chỉ dùng cho user input - có thể defer    |

**Action:** Remove `date-fns` nếu đã migrate hết sang `dayjs` (có cả 2 trong deps).

---

## Build Performance Analysis

**Current target:** `vite.config.ts:134` → es2020, Safari 14, Chrome 87, Firefox 78

**chunkSizeWarningLimit:** 600KB (line 138)

**Recommendation:**
- Lower limit xuống 500KB sau khi fix manualChunks
- Add preload hints cho critical chunks

---

## Top 5 Code Splitting Opportunities (Priority Order)

### 1. **HIGH: Fix Circular Dependency + Re-enable manualChunks**

**Impact:** Reduce main bundle ~100KB
**Effort:** Medium (investigate circular dep)
**Files:** `vite.config.ts`, likely issue trong vendor imports

**Steps:**
1. Build với verbose mode: `vite build --debug`
2. Identify circular import chain (likely MUI + i18n + date libs)
3. Break circular dep bằng dynamic import hoặc refactor
4. Re-enable manualChunks config ở trên

---

### 2. **HIGH: Lazy Load Recharts Components**

**Impact:** Defer ~150KB khỏi main bundle
**Effort:** Low
**Files:**
- `src/features/admin/reports/components/daily-revenue-chart.tsx`
- `src/features/admin/reports/components/top-items-table.tsx`

**Implementation:**
```tsx
// In AdminAnalyticsPage
const DailyRevenueChart = lazy(() => import('./components/daily-revenue-chart'));
const TopItemsTable = lazy(() => import('./components/top-items-table'));

// Wrap in Suspense
<Suspense fallback={<ChartSkeleton />}>
  <DailyRevenueChart data={data} />
</Suspense>
```

---

### 3. **MEDIUM: Remove date-fns (Duplicate Library)**

**Impact:** ~10-15KB reduction
**Effort:** Low (if migration complete)
**Files:** `package.json`, verify no `import ... from 'date-fns'` trong codebase

**Verification:**
```bash
grep -r "from 'date-fns'" src/ --include="*.ts" --include="*.tsx"
```

If 0 results → safe to remove from package.json.

---

### 4. **MEDIUM: Dynamic Import PWA Components**

**Impact:** ~25KB defer for non-PWA browsers
**Effort:** Low
**Files:**
- `src/features/pwa/install-prompt.tsx`
- `src/features/pwa/reload-prompt.tsx`

**Implementation:**
```tsx
// In app-provider.tsx
const InstallPrompt = lazy(() => import('@/features/pwa/install-prompt'));
const ReloadPrompt = lazy(() => import('@/features/pwa/reload-prompt'));
```

---

### 5. **LOW: Preload Critical Chunks**

**Impact:** Faster perceived load
**Effort:** Medium
**Files:** `vite.config.ts`, `index.html`

**Add preload hints:**
```html
<link rel="modulepreload" href="/assets/vendor-react.js">
<link rel="modulepreload" href="/assets/vendor-mui.js">
```

Hoặc config trong Vite build.rollupOptions.output.manualChunks.

---

## Recommendations Summary

| Priority | Action                          | Impact        | Effort | Est. Reduction |
|----------|---------------------------------|---------------|--------|----------------|
| HIGH     | Fix circular dep + manualChunks | Main bundle   | MED    | ~100KB         |
| HIGH     | Lazy load recharts              | Admin defer   | LOW    | ~150KB         |
| MED      | Remove date-fns duplicate       | Tree-shaking  | LOW    | ~15KB          |
| MED      | Dynamic PWA components          | Non-PWA defer | LOW    | ~25KB          |
| LOW      | Add preload hints               | Perceived UX  | MED    | 0KB (faster)   |

**Total potential reduction:** ~290KB gzipped (từ ~650KB → ~360KB)

---

## Binh Pháp Compliance

**Front 3: Performance (謀攻 - Attack by Stratagem)**
- ✅ Code splitting with React.lazy: IMPLEMENTED (11 routes)
- ❌ Configure manualChunks: DISABLED (bug)
- ⚠️ Image optimization: OK (WebP)
- **Goal: Build <10s** → Current không đo nhưng stack nhẹ, likely pass

**Verdict:** PARTIAL COMPLIANCE - manualChunks issue blocking full optimization.

---

## Next Steps

1. **IMMEDIATE:** Investigate circular dependency error (priority HIGH)
2. **WEEK 1:** Lazy load recharts components
3. **WEEK 1:** Audit date-fns usage, remove if unused
4. **WEEK 2:** Re-enable manualChunks với vendor splits
5. **WEEK 2:** Add bundle analyzer to CI/CD

**Measurement:**
```bash
npm run build
ls -lh dist/assets/*.js  # Check chunk sizes
npx vite-bundle-visualizer  # Visual analysis
```

---

## Unresolved Questions

1. Root cause của circular dependency trong vendor-misc chunk?
2. Date-fns còn được dùng ở đâu? (verify trước khi remove)
3. Có cần split @mui/material theo features? (e.g., Dialog, DataGrid riêng chunk)
4. PWA service worker size có cần optimize không? (workbox config)

---

**Review Date:** 2026-02-12
**Next Review:** After manualChunks fix (estimated 1 week)
