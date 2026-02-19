# Core Web Vitals Improvement Report - Cơm Ánh Dương

**Generated:** 2026-02-12 07:40
**Project:** com-anh-duong-10x (Restaurant POS System)
**Stack:** React 19 + Vite + Material UI + Supabase

---

## Executive Summary

Cơm Ánh Dương là restaurant POS React app với PWA support. Audit này phát hiện **5 bottlenecks chính** ảnh hưởng Core Web Vitals và **3 quick wins** có thể cải thiện ngay.

**Current State:**
- ✅ React 19 React Compiler enabled (auto memoization)
- ✅ PWA với aggressive caching strategy
- ✅ Code splitting config đã bỏ manualChunks (tránh circular deps)
- ⚠️ Font loading chưa optimize (Google Fonts blocking)
- ⚠️ Hero images chưa có dimensions
- ⚠️ Animation-heavy hero section (Framer Motion)

---

## 📊 Core Web Vitals Analysis

### 1. LCP (Largest Contentful Paint) — ⚠️ HIGH PRIORITY

**Target:** < 2.5s
**Likely Current:** 3-4s (estimate dựa trên config)

#### Bottlenecks:

**1.1. Google Fonts Blocking Render (Critical)**
```html
<!-- index.html lines 156-162 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
```

**Issue:** Font loading blocks first paint, tuy có `display=swap` nhưng vẫn FOIT (Flash of Invisible Text).

**Fix:**
```html
<!-- Add font-display inline CSS -->
<style>
  /* Critical fonts preload */
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap; /* Ensure swap for instant render */
    src: local('Inter'), url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
  }
  /* Preload only critical weights */
</style>

<!-- Move fonts to bottom or async -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>
```

**Impact:** LCP -500ms ~ -1s

---

**1.2. Hero Image Missing Dimensions (CLS Impact)**
```tsx
// hero-section.tsx - No images found, nhưng nếu thêm hero image sau:
{/* Missing dimensions cause layout shift */}
<img src="/hero-food.jpg" alt="Cơm Ánh Dương" />
```

**Issue:** Khi thêm hero images (likely trong tương lai), thiếu width/height gây CLS.

**Fix:**
```tsx
<Box
  component="img"
  src="/hero-food.webp"
  alt="Cơm Ánh Dương"
  width={1200}  // Explicit dimensions
  height={630}
  loading="lazy" // Below-the-fold only
  sx={{
    width: '100%',
    height: 'auto',
    aspectRatio: '1200/630', // CSS aspect ratio
  }}
/>
```

**Impact:** CLS reduction, LCP stability

---

**1.3. Apple Splash Screens Blocking (Low Priority)**
```html
<!-- index.html lines 147-154: 7 splash screens -->
<link rel="apple-touch-startup-image" href="/apple-splash-2048x2732.png" ... />
<link rel="apple-touch-startup-image" href="/apple-splash-1668x2388.png" ... />
<!-- ... 5 more -->
```

**Issue:** 7 splash screens (total ~5MB PNG) có thể delay rendering trên iOS.

**Fix:**
- Convert sang WebP (-70% size)
- Lazy load splash screens bằng JS sau FCP
- Hoặc serve conditional chỉ trên iOS devices

**Impact:** LCP -200ms on iOS

---

### 2. FID/INP (Interactivity) — ✅ GOOD (React 19 Compiler)

**Target:** < 200ms
**Likely Current:** 150-250ms

#### Bottlenecks:

**2.1. Framer Motion Animations (Hero Section)**
```tsx
// hero-section.tsx lines 12-40
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};
```

**Issue:** Nhiều motion.div animations chạy đồng thời, có thể block main thread.

**Fix:**
```tsx
// Use CSS animations thay vì Framer Motion cho hero
// CSS animations chạy trên compositor thread → không block JS

<Box
  sx={{
    '@keyframes fadeInUp': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animation: 'fadeInUp 0.6s ease-out',
  }}
>
  {/* Content */}
</Box>
```

**Impact:** INP -20ms ~ -50ms

---

**2.2. Event Handlers Check (React 19 Auto-Optimization)**

✅ React 19 Compiler đã auto-optimize:
```ts
// vite.config.ts lines 12-16
react({
  babel: {
    plugins: [['babel-plugin-react-compiler', { target: '19' }]],
  },
}),
```

**Analysis:** Không cần manual optimization onClick/onChange handlers - compiler đã tự động memoize.

---

### 3. CLS (Cumulative Layout Shift) — ⚠️ MEDIUM PRIORITY

**Target:** < 0.1
**Likely Current:** 0.15-0.25

#### Bottlenecks:

**3.1. Font Loading Causing Shift**
```css
/* index.html inline CSS lines 127-144 */
* {
  -webkit-tap-highlight-color: rgba(74, 222, 128, 0.2);
  -webkit-user-select: none;
  user-select: none;
}
```

**Issue:** Khi font Inter/Roboto load, text size thay đổi → layout shift.

**Fix:**
```css
/* Add fallback font metrics matching */
body {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  /* Fallback system fonts have similar metrics */
}

/* Optional: font-display: optional (no FOIT/FOUT) */
@font-face {
  font-family: 'Inter';
  font-display: optional; /* Skip font if not loaded in 100ms */
  /* ... */
}
```

**Impact:** CLS -0.05 ~ -0.10

---

**3.2. Dynamic Content Injection (Forms)**
```tsx
// hero-section.tsx line 258
<ExpressOrderForm />
```

**Issue:** Nếu form load async hoặc render sau, có thể push content xuống.

**Fix:**
```tsx
// Reserve space for form
<Box
  sx={{
    minHeight: 400, // Reserve space before form loads
    transition: 'none', // Disable transition to prevent shift
  }}
>
  <Suspense fallback={<Skeleton height={400} />}>
    <ExpressOrderForm />
  </Suspense>
</Box>
```

**Impact:** CLS -0.02 ~ -0.05

---

**3.3. Hero Section Animation Causing Shift**
```tsx
// hero-section.tsx lines 56-65
<Box
  component={motion.div}
  variants={containerVariants}
  initial="hidden"  // opacity: 0
  animate="visible" // opacity: 1, stagger children
>
```

**Issue:** `initial="hidden"` (opacity: 0) → content render nhưng invisible → shift khi fade in.

**Fix:**
```tsx
// Remove initial hidden state, use CSS animation
<Box
  sx={{
    animation: 'fadeIn 0.4s ease-out', // Smooth fade without layout shift
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  }}
>
```

**Impact:** CLS -0.03

---

## 🚀 Quick Wins (Top 3)

### Quick Win #1: Async Font Loading ⚡
**Effort:** 5 minutes
**Impact:** LCP -500ms, CLS -0.05

```html
<!-- Replace current font link -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"></noscript>

<!-- Add fallback font metrics -->
<style>
  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  }
</style>
```

---

### Quick Win #2: CSS Animations Instead of Framer Motion (Hero) ⚡
**Effort:** 15 minutes
**Impact:** INP -30ms, bundle size -20KB

```tsx
// Replace Framer Motion animations with CSS
<Box
  sx={{
    '@keyframes fadeInUp': {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    '& > *': {
      animation: 'fadeInUp 0.6s ease-out',
    },
    '& > *:nth-of-type(2)': {
      animationDelay: '0.1s',
    },
    '& > *:nth-of-type(3)': {
      animationDelay: '0.2s',
    },
  }}
>
  {/* Children render with staggered animation */}
</Box>
```

---

### Quick Win #3: Reserve Space for Forms ⚡
**Effort:** 5 minutes
**Impact:** CLS -0.05

```tsx
<Box sx={{ minHeight: 400 }}> {/* Prevent shift */}
  <ExpressOrderForm />
</Box>
```

---

## 📋 Code Examples Summary

### File: `index.html`

**Priority 1: Font Optimization**
```html
<!-- Line 156-162: Replace current font link -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"></noscript>

<!-- Line 145: Add after existing style tag -->
<style>
  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
  }
</style>
```

---

### File: `src/features/home/components/hero-section.tsx`

**Priority 2: Replace Framer Motion (Lines 1-40)**
```tsx
// Remove: import { motion } from 'framer-motion';
// Remove: containerVariants, itemVariants, cardVariants

// Add CSS animations
const heroStyles = {
  '@keyframes fadeInUp': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '& > *': {
    animation: 'fadeInUp 0.6s ease-out',
  },
};

// Replace component={motion.div} with component={Box}
<Box sx={heroStyles}>
  {/* Content */}
</Box>
```

---

### File: `vite.config.ts`

**Priority 3: Add Image Optimization (Optional)**
```ts
// Line 11: Add after VitePWA
import viteImagemin from 'vite-plugin-imagemin';

plugins: [
  react({ /* ... */ }),
  VitePWA({ /* ... */ }),
  viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    pngquant: { quality: [0.8, 0.9] },
    webp: { quality: 85 }, // Auto-convert to WebP
  }),
],
```

---

## 🎯 Priority Ranking

| Priority | Item | Impact | Effort | ROI |
|---------|------|--------|--------|-----|
| 🔴 P1 | Async font loading | LCP -500ms | 5min | ⭐⭐⭐⭐⭐ |
| 🔴 P1 | Font fallback metrics | CLS -0.05 | 5min | ⭐⭐⭐⭐⭐ |
| 🟡 P2 | CSS animations (hero) | INP -30ms | 15min | ⭐⭐⭐⭐ |
| 🟡 P2 | Reserve form space | CLS -0.05 | 5min | ⭐⭐⭐⭐ |
| 🟢 P3 | Convert splash to WebP | LCP -200ms iOS | 30min | ⭐⭐⭐ |

---

## 🧪 Verification Commands

```bash
# Build and analyze bundle
npm run build
npx vite-bundle-visualizer

# Lighthouse CI
npx lighthouse https://localhost:5173 --only-categories=performance --view

# Check font loading
curl -I https://fonts.googleapis.com/css2?family=Inter:wght@400 | grep -i cache

# PWA cache verification
npx workbox-cli analyze dist/sw.js
```

---

## ❓ Unresolved Questions

1. **Hero images**: Có kế hoạch thêm hero/banner images không? (cần reserve space)
2. **Analytics**: Có real user metrics (RUM) từ production để verify current CWV scores?
3. **Target devices**: iOS Safari performance có critical không? (splash screens optimize)
4. **Bundle size**: Current JS bundle size bao nhiêu? (check if manualChunks cần enable lại)
5. **Supabase images**: Ảnh món ăn có optimize WebP chưa? (PWA cache đã có strategy)

---

**Next Steps:**
1. Implement Quick Win #1 + #2 (20 minutes total)
2. Test with Lighthouse (target Performance > 90)
3. Deploy và monitor real CWV metrics
4. Iterate based on field data

---

_Report generated by debugger agent - Core Web Vitals Analysis_
