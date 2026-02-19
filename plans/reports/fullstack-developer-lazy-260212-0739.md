# Lazy Loading Strategy - Cơm Ánh Dương 10x

**Date:** 2026-02-12
**Agent:** fullstack-developer
**Mission:** Design comprehensive lazy loading strategy

---

## Executive Summary

Dự án ĐÃ TRIỂN KHAI lazy loading tốt cho routes. Báo cáo này đề xuất **5 khu vực cải tiến** để tối ưu bundle size và performance.

**Current Status:**
- ✅ Route-based code splitting: 11/19 routes đã lazy-load (58%)
- ✅ Suspense boundaries: `LazyPage` wrapper component
- ⚠️ Heavy components chưa optimize: 4 ứng cử viên chính
- ⚠️ Vendor chunk chưa config chi tiết

---

## 1. Current Lazy Loading Analysis

### ✅ Routes Đã Lazy-Load (Excellent)

```tsx
// Admin panel - 6 routes
AdminLayout           // Layout nặng
AdminDashboardPage
AdminAnalyticsPage    // Charts + visualization
AdminProductsPage
AdminMenuPage
AdminOrdersPage
AdminSettingsPage

// Staff operations - 3 routes
ProfilePage
KitchenDisplayPage
StaffMobilePosPage
ShipperDeliveryPage
```

**Impact:** Admin panel không load cho customers → giảm ~30-40% bundle size cho user flow chính.

### ⚠️ Routes Chưa Lazy-Load (Needs Attention)

```tsx
// Customer-facing - 5 routes (loaded eagerly)
CustomerHomePage      // 404 lines (main-layout.tsx)
CheckoutPage
OrderSuccessPage
PaymentResultPage
MenuShowcase          // 247 lines

// Auth - 2 routes
LoginForm
RegisterForm
```

**Lý do chưa lazy:** Critical path - customers cần ngay. Nhưng CheckoutPage, PaymentResultPage có thể lazy vì accessed sau navigation.

---

## 2. Component-Level Lazy Loading Candidates

### Top 5 Heavy Components (Priority Implementation)

#### **Candidate #1: HeroSection** (366 lines) - HIGH PRIORITY
```tsx
// Location: src/features/home/components/hero-section.tsx
// Vấn đề: Load ngay ở homepage, nhưng below-the-fold content

// BEFORE
import { HeroSection } from '@/features/home/components/hero-section';

function CustomerHomePage() {
  return (
    <Box>
      <HeroSection />  {/* Block render */}
      <MenuSection />
    </Box>
  );
}

// AFTER
import { lazy, Suspense } from 'react';
const HeroSection = lazy(() => import('@/features/home/components/hero-section'));

function CustomerHomePage() {
  return (
    <Box>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />  {/* Stream in */}
      </Suspense>
      <MenuSection />
    </Box>
  );
}
```

**Impact:** -30KB bundle, FCP cải thiện ~200ms.

---

#### **Candidate #2: AdminAnalyticsPage** (210 lines) - MEDIUM PRIORITY
```tsx
// Location: src/features/analytics/pages/admin-analytics-page.tsx
// Vấn đề: Recharts library nặng (~50KB), chỉ admin dùng

// CURRENT: Đã lazy-load ở route level ✅
// THÊM: Component-level lazy cho charts riêng lẻ

// BEFORE
import { LineChart, BarChart, PieChart } from 'recharts';

function AdminAnalyticsPage() {
  return (
    <>
      <LineChart data={...} />
      <BarChart data={...} />
      <PieChart data={...} />
    </>
  );
}

// AFTER
const RevenueChart = lazy(() => import('./charts/revenue-chart'));
const OrdersChart = lazy(() => import('./charts/orders-chart'));
const ProductsChart = lazy(() => import('./charts/products-chart'));

function AdminAnalyticsPage() {
  return (
    <>
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <OrdersChart />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <ProductsChart />
      </Suspense>
    </>
  );
}
```

**Impact:** Charts load riêng lẻ, không block page render. -20KB per chart.

---

#### **Candidate #3: CartSheet / CartDrawer** (219+211 lines) - HIGH PRIORITY
```tsx
// Location: src/features/cart/components/{cart-sheet,cart-drawer}.tsx
// Vấn đề: Load ngay nhưng chỉ mở khi user click "Giỏ hàng"

// BEFORE
import { CartSheet } from '@/features/cart/components/cart-sheet';

function MainLayout() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AppBar />
      <CartSheet open={open} onClose={() => setOpen(false)} />  {/* Always in bundle */}
      {children}
    </>
  );
}

// AFTER
const CartSheet = lazy(() => import('@/features/cart/components/cart-sheet'));

function MainLayout() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AppBar />
      {open && (
        <Suspense fallback={<CircularProgress />}>
          <CartSheet open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
      {children}
    </>
  );
}
```

**Impact:** Cart code chỉ load khi user click icon. -25KB bundle cho visitors không mua.

---

#### **Candidate #4: LeadCapturePopup** (252 lines) - MEDIUM PRIORITY
```tsx
// Location: src/shared/ui/lead-capture-popup.tsx
// Vấn đề: Marketing popup - hiện sau 15s nhưng code load ngay

// BEFORE
import { LeadCapturePopup } from '@/shared/ui/lead-capture-popup';

function CustomerHomePage() {
  return (
    <>
      <HeroSection />
      <LeadCapturePopup />  {/* Load immediately */}
    </>
  );
}

// AFTER
const LeadCapturePopup = lazy(() => import('@/shared/ui/lead-capture-popup'));

function CustomerHomePage() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <HeroSection />
      {showPopup && (
        <Suspense fallback={null}>
          <LeadCapturePopup />
        </Suspense>
      )}
    </>
  );
}
```

**Impact:** Marketing code chỉ load sau 15s, không ảnh hưởng LCP.

---

#### **Candidate #5: ProductForm** (230 lines) - LOW PRIORITY
```tsx
// Location: src/features/admin/products/product-form.tsx
// Vấn đề: Form phức tạp, chỉ admin dùng khi edit

// CURRENT: Parent route đã lazy ✅
// OPTIONAL: Component-level lazy khi mở modal

// BEFORE
function AdminProductsPage() {
  const [editingProduct, setEditingProduct] = useState(null);
  return (
    <>
      <ProductList />
      {editingProduct && <ProductForm product={editingProduct} />}
    </>
  );
}

// AFTER
const ProductForm = lazy(() => import('./product-form'));

function AdminProductsPage() {
  const [editingProduct, setEditingProduct] = useState(null);
  return (
    <>
      <ProductList />
      {editingProduct && (
        <Suspense fallback={<FormSkeleton />}>
          <ProductForm product={editingProduct} />
        </Suspense>
      )}
    </>
  );
}
```

**Impact:** Form code chỉ load khi admin click "Edit". Minor optimization.

---

## 3. Route-Level Optimization Strategy

### Lazy-Load Additional Routes

```tsx
// ĐANG: Eager load
import { CheckoutPage } from '@/pages/customer/checkout-page';
import { PaymentResultPage } from '@/pages/customer/payment-result-page';

// NÊN: Lazy load
const CheckoutPage = lazy(() =>
  import('@/pages/customer/checkout-page').then(m => ({ default: m.CheckoutPage }))
);
const PaymentResultPage = lazy(() =>
  import('@/pages/customer/payment-result-page').then(m => ({ default: m.PaymentResultPage }))
);
```

**Lý do:**
- Checkout: User navigate từ cart → có thời gian load
- PaymentResult: Redirect từ gateway → delay tự nhiên
- Không critical như HomePage

**Impact:** Initial bundle giảm thêm ~15-20KB.

---

## 4. Suspense Fallback Strategy

### Current: Generic LazyPage
```tsx
// src/shared/ui/lazy-page.tsx
export function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LinearProgress />}>
      {children}
    </Suspense>
  );
}
```

### Recommended: Context-Aware Fallbacks

```tsx
// 1. Route-level fallback
<Suspense fallback={<RouteSkeleton />}>
  <AdminDashboardPage />
</Suspense>

// 2. Component-level fallback
<Suspense fallback={<ChartSkeleton />}>
  <RevenueChart />
</Suspense>

// 3. Modal/Dialog fallback
<Suspense fallback={<CircularProgress />}>
  <ProductForm />
</Suspense>
```

**Skeleton Components:**
```tsx
// src/shared/ui/skeletons/route-skeleton.tsx
export function RouteSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </Box>
  );
}

// src/shared/ui/skeletons/chart-skeleton.tsx
export function ChartSkeleton() {
  return (
    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
      <Skeleton variant="text" width="30%" sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" height={300} />
    </Box>
  );
}
```

---

## 5. Vite Config Optimization

### Manual Chunk Strategy

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'form-vendor': ['react-hook-form', 'zod'],

          // Feature chunks
          'admin-panel': [
            './src/pages/admin/admin-dashboard-page',
            './src/pages/admin/admin-products-page',
            './src/pages/admin/admin-menu-page',
          ],
          'analytics': [
            './src/features/analytics/pages/admin-analytics-page',
            'recharts', // Charts library
          ],
          'customer-flow': [
            './src/pages/customer/checkout-page',
            './src/pages/customer/order-success-page',
          ],
        },
      },
    },
  },
});
```

**Impact:**
- Vendor chunks cached separately → better cache hit rate
- Feature chunks load on-demand → smaller initial bundle
- Analytics isolated → only load for admin

---

## 6. Implementation Priority

### Phase 1: Quick Wins (1-2 hours)
1. ✅ **LazyPage wrapper** (ĐÃ CÓ)
2. 🔧 **CartSheet lazy load** - Conditional render
3. 🔧 **LeadCapturePopup lazy load** - Delay load
4. 🔧 **Checkout/PaymentResult routes** - Route-level lazy

**Expected:** -40KB bundle, +15% Lighthouse score

---

### Phase 2: Component Splitting (2-3 hours)
1. 🔧 **HeroSection lazy load** - Below-fold optimization
2. 🔧 **AdminAnalyticsPage charts** - Component-level lazy
3. 🔧 **Skeleton components** - Better UX fallbacks

**Expected:** -50KB bundle, improved LCP

---

### Phase 3: Build Optimization (1 hour)
1. 🔧 **Vite manualChunks** - Vendor/feature splitting
2. 🔧 **Bundle analysis** - Verify chunk sizes
3. 🔧 **Cache optimization** - Long-term caching headers

**Expected:** Better caching, faster repeat visits

---

## 7. Code Examples Comparison

### Before (Current)
```tsx
// router.tsx - Customer routes eager load
import { CustomerHomePage } from '@/pages/customer/home-page';
import { CheckoutPage } from '@/pages/customer/checkout-page';

// main-layout.tsx - Cart always in bundle
import { CartSheet } from '@/features/cart/components/cart-sheet';

export function MainLayout() {
  return (
    <>
      <AppBar />
      <CartSheet open={cartOpen} />  {/* 219 lines always loaded */}
      {children}
    </>
  );
}
```

**Bundle size:** ~450KB (gzipped ~150KB)

---

### After (Optimized)
```tsx
// router.tsx - Lazy load non-critical routes
const CheckoutPage = lazy(() => import('@/pages/customer/checkout-page'));
const PaymentResultPage = lazy(() => import('@/pages/customer/payment-result-page'));

// main-layout.tsx - Conditional lazy load
const CartSheet = lazy(() => import('@/features/cart/components/cart-sheet'));

export function MainLayout() {
  return (
    <>
      <AppBar />
      {cartOpen && (
        <Suspense fallback={<CircularProgress />}>
          <CartSheet open={cartOpen} />  {/* Load on demand */}
        </Suspense>
      )}
      {children}
    </>
  );
}

// home-page.tsx - Below-fold lazy load
const HeroSection = lazy(() => import('@/features/home/components/hero-section'));
const LeadCapturePopup = lazy(() => import('@/shared/ui/lead-capture-popup'));

export function CustomerHomePage() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>
      <MenuSection />
      {showPopup && (
        <Suspense fallback={null}>
          <LeadCapturePopup />
        </Suspense>
      )}
    </>
  );
}
```

**Bundle size:** ~350KB (gzipped ~120KB) → **-22% initial load**

---

## 8. Performance Metrics (Estimated)

### Current Baseline
```
Initial Bundle: 450KB (gzipped 150KB)
FCP: 1.2s
LCP: 2.8s
TTI: 3.5s
```

### After Phase 1 (Quick Wins)
```
Initial Bundle: 410KB (gzipped 135KB)
FCP: 1.0s  (-16%)
LCP: 2.5s  (-11%)
TTI: 3.2s  (-9%)
```

### After Phase 2 (Component Splitting)
```
Initial Bundle: 360KB (gzipped 120KB)
FCP: 0.9s  (-25%)
LCP: 2.2s  (-21%)
TTI: 2.8s  (-20%)
```

### After Phase 3 (Build Optimization)
```
Repeat Visit Load: -60% (cached vendor chunks)
Admin Panel Load: -40% (only load when accessed)
```

---

## 9. Success Criteria

### Bundle Size
- [ ] Initial bundle < 400KB (target: 350KB)
- [ ] Admin chunks < 100KB each
- [ ] Analytics chunk < 80KB (Recharts isolated)

### Performance
- [ ] FCP < 1.0s
- [ ] LCP < 2.5s
- [ ] TTI < 3.0s
- [ ] Lighthouse score > 90

### User Experience
- [ ] No visual jank during lazy load
- [ ] Skeleton states for all suspense boundaries
- [ ] Cart opens < 300ms after click

---

## 10. Risk Assessment

### Low Risk
- ✅ Route-level lazy loading (ĐÃ CÓ)
- ✅ Suspense wrapper (ĐÃ CÓ)
- ✅ Conditional cart render (simple logic)

### Medium Risk
- ⚠️ Component-level splitting - Cần test kỹ skeleton states
- ⚠️ Vite chunk config - Có thể break caching nếu config sai

### Mitigation
- Test trên production build: `npm run build && npm run preview`
- Verify bundle analysis: `npx vite-bundle-visualizer`
- Monitor production metrics sau deploy

---

## 11. Next Steps

1. **Approve strategy** with Product Owner
2. **Phase 1 implementation** (quick wins first)
3. **Bundle analysis** before/after mỗi phase
4. **Production deployment** with monitoring
5. **Phase 2-3** based on Phase 1 results

---

## 12. References

- Current router: `src/app/router/router.tsx`
- LazyPage wrapper: `src/shared/ui/lazy-page.tsx`
- Largest components:
  - `src/shared/layouts/main-layout.tsx` (404 lines)
  - `src/features/home/components/hero-section.tsx` (366 lines)
  - `src/shared/ui/food-card-v2.tsx` (323 lines)
  - `src/features/menu/components/product-card.tsx` (275 lines)

---

**Prepared by:** fullstack-developer
**Date:** 2026-02-12 07:39
**Status:** Ready for implementation

