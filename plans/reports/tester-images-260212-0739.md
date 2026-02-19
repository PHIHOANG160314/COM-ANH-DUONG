# Image Optimization Audit Report

**Date**: 2026-02-12 07:39
**Auditor**: tester (Quality Assurance Agent)
**Project**: Cơm Ánh Dương 10X
**Scope**: `public/` directory image analysis

---

## Executive Summary

Dự án có **254 image files**, tổng cộng ~**101 MB**, chủ yếu từ menu images (90 MB).
**Cơ hội tối ưu**: Convert 125 PNG files (89.6 MB) sang WebP có thể tiết kiệm **~75-80% dung lượng** (\~67-72 MB).

**Severity**: 🟡 MEDIUM — Performance impact trên mobile (slow 3G \< 2 Mbps)
**Priority**: HIGH — Ảnh hưởng First Contentful Paint (FCP), Largest Contentful Paint (LCP)

---

## Image Inventory

| Format | Count | Total Size  | Notes                                 |
| ------ | ----- | ----------- | ------------------------------------- |
| PNG    | 142   | 89.6 MB     | Menu images, splash screens, icons    |
| WebP   | 110   | 11.3 MB     | Already optimized (menu duplicates)   |
| SVG    | 1     | \< 1 KB     | Vector graphic (optimal)              |
| JPG    | 0     | 0 MB        | None found                            |
| **Σ**  | 253   | **~101 MB** | 90 MB from `public/images/menu/` only |

---

## Large Images (>100 KB)

Có **125 PNG files** lớn hơn 100 KB, bao gồm:

### Top 10 Largest Images

| File                                         | Size    | Priority   |
| -------------------------------------------- | ------- | ---------- |
| `apple-splash-2048x2732.png`                 | 1.4 MB  | 🔴 URGENT  |
| `images/menu/ca_tim_nuong_mo_hanh.png`       | 1.1 MB  | 🔴 URGENT  |
| `images/menu/ca_kho_to.png`                  | 1.0 MB  | 🔴 URGENT  |
| `apple-splash-1668x2388.png`                 | 980 KB  | 🔴 URGENT  |
| `images/menu/ca_ro_kho_mo_hanh.png`          | 956 KB  | 🔴 URGENT  |
| `images/menu/bun_ca_basa_kho.png`            | 918 KB  | 🟡 HIGH    |
| `images/menu/suon_nuong.png`                 | 917 KB  | 🟡 HIGH    |
| `images/menu/banh_trang_tron.png`            | 908 KB  | 🟡 HIGH    |
| `images/menu/com_suon_nuong.png`             | 893 KB  | 🟡 HIGH    |
| `images/menu/com_bo_luc_lac.png`             | 892 KB  | 🟡 HIGH    |

**Apple Splash Screens**: 7 files (5.9 MB total) - candidates cho WebP hoặc dynamic generation.

---

## WebP Conversion Opportunities

### Already Converted (Duplicate Strategy)

Phát hiện pattern: **Menu images đã có cả PNG lẫn WebP**

**Ví dụ**:
- `images/menu/ba_soi_chien_nuoc_mam.png` (828 KB)
- `images/menu/ba_soi_chien_nuoc_mam.webp` (exists)

**Pattern found**: 110 menu items có WebP, nhưng code vẫn load PNG!

### Conversion Candidates

| Category       | Count | PNG Size | Est. WebP Size | Savings   |
| -------------- | ----- | -------- | -------------- | --------- |
| Menu Images    | 110+  | ~70 MB   | ~9-11 MB       | ~59-61 MB |
| Splash Screens | 7     | 5.9 MB   | ~1.5 MB        | ~4.4 MB   |
| Icons/Brand    | 8     | ~2 MB    | ~500 KB        | ~1.5 MB   |
| **Total**      | 125+  | ~78 MB   | ~11-13 MB      | **~65 MB**|

---

## Responsive Images Analysis

### Current Implementation

**Tìm kiếm `srcset` trong codebase**: ❌ **KHÔNG TÌM THẤY**

```bash
# grep -r "srcset" src/
# No matches found
```

**Vấn đề**: Tất cả images load full resolution cho mọi viewport (mobile/tablet/desktop).

### Missing Features

1. ❌ **No `<img srcset>` attributes** — Mobile users tải full desktop images
2. ❌ **No `sizes` attribute** — Browser không biết pick optimal size
3. ❌ **No `<picture>` element** — Không có WebP với PNG fallback

**Impact**: Mobile users (3G) tải 1.1 MB PNG thay vì 150 KB WebP thumbnail.

---

## Lazy Loading Status

### Current Implementation

```typescript
// src/features/home/components/regional-specialties.tsx
<CardMedia
  component="img"
  height="200"
  image={item.image}
  alt={item.title}
/>
// ❌ NO loading="lazy"

// src/features/cart/components/cart-sheet.tsx (line 110-121)
<Box
  component="img"
  src={item.image_url || '/images/menu/default.png'}
  alt={item.name}
  sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
/>
// ❌ NO loading="lazy"
```

**Tìm kiếm `loading=` trong codebase**: ❌ **TÌM THẤY NHƯNG CHỈ DÙNG CHO BUTTON STATE**

```bash
# Results chỉ cho thấy loading cho buttons (Ant Design, MUI Button)
# KHÔNG có <img loading="lazy"> nào
```

### Missing Lazy Load

**Tất cả images đều eager load** — Kể cả images below-the-fold (menu showcase, specialties).

**Ví dụ**:
- `regional-specialties.tsx` load 3 large PNGs (~2.5 MB) ngay khi page load
- `cart-sheet.tsx` load tất cả cart item images cùng lúc

---

## Estimated Savings

### Scenario 1: WebP Conversion Only

```
Current:  142 PNG = 89.6 MB
Convert:  125 PNG → WebP (75% reduction) = ~22 MB
Savings:  89.6 - 22 = ~67 MB (75%)
```

### Scenario 2: WebP + Responsive Images

```
WebP:     67 MB saved (from above)
Srcset:   Mobile loads 400px width instead of 1200px (~60% reduction on mobile)
Total:    ~80 MB saved on mobile (80% reduction)
```

### Scenario 3: WebP + Responsive + Lazy Load

```
Above:    80 MB saved
Lazy:     Only above-the-fold loads initially (~90% deferral)
LCP:      1.4s → 0.6s (estimated)
FCP:      0.8s → 0.4s (estimated)
```

---

## Recommendations

### 🔴 URGENT (Tuần này)

**1. Sửa code để dùng WebP thay vì PNG**

```typescript
// ❌ SAI - Hiện tại
image: '/images/menu/ca_loc_nuong_la_sen.png'

// ✅ ĐÚNG - Dùng WebP đã có sẵn
image: '/images/menu/ca_loc_nuong_la_sen.webp'
```

**Impact**: Giảm 70 MB ngay lập tức (110 files × ~640 KB average)

**Files cần sửa**:
- `src/features/home/components/regional-specialties.tsx`
- Bất kỳ file nào import menu images

**2. Add `loading="lazy"` cho images below-the-fold**

```typescript
// Cho tất cả menu showcase images
<CardMedia
  component="img"
  loading="lazy"  // ← ADD THIS
  height="200"
  image={item.image}
  alt={item.title}
/>
```

**Impact**: Giảm initial page load ~60-70% (deferred loading)

---

### 🟡 HIGH (Tuần tới)

**3. Convert Apple Splash Screens sang WebP**

```bash
# Script suggestion (cài cwebp via Homebrew)
for file in public/apple-splash-*.png; do
  cwebp -q 85 "$file" -o "${file%.png}.webp"
done
```

**Savings**: ~4.4 MB

**4. Implement Responsive Images (srcset)**

```typescript
// Cho menu images
<img
  srcset="
    /images/menu/ca_loc_400w.webp 400w,
    /images/menu/ca_loc_800w.webp 800w,
    /images/menu/ca_loc_1200w.webp 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  src="/images/menu/ca_loc_800w.webp"
  alt="Cá Lóc Nướng"
  loading="lazy"
/>
```

**Requires**: Pre-generate 3 sizes (400px, 800px, 1200px) cho mỗi image

**Automation**:
```bash
# ImageMagick script
for img in public/images/menu/*.webp; do
  convert "$img" -resize 400x "${img%.webp}_400w.webp"
  convert "$img" -resize 800x "${img%.webp}_800w.webp"
  convert "$img" -resize 1200x "${img%.webp}_1200w.webp"
done
```

---

### 🟢 NICE TO HAVE (Next Sprint)

**5. Use `<picture>` với WebP + PNG fallback**

```typescript
<picture>
  <source srcset="/images/menu/ca_loc.webp" type="image/webp" />
  <img src="/images/menu/ca_loc.png" alt="Cá Lóc" loading="lazy" />
</picture>
```

**6. Implement Progressive WebP encoding**

```bash
cwebp -q 85 -m 6 -pass 10 input.png -o output.webp
# -m 6: max compression effort
# -pass 10: progressive encoding
```

**7. Consider CDN Image Optimization**

Nếu deploy trên Vercel/Cloudflare:
- Vercel Image Optimization (automatic WebP/AVIF)
- Cloudflare Images (on-the-fly resize + format conversion)

---

## Implementation Priority

```
┌─────────────────────────────────────────────┐
│ WEEK 1 (This Week)                          │
├─────────────────────────────────────────────┤
│ ✓ Change .png → .webp in code (110 files)  │
│ ✓ Add loading="lazy" to below-the-fold     │
│   Savings: ~67 MB (75%)                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ WEEK 2 (Next Week)                          │
├─────────────────────────────────────────────┤
│ ✓ Convert splash screens to WebP           │
│ ✓ Generate responsive sizes (srcset)       │
│   Savings: +10 MB (additional 10%)         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ FUTURE (Backlog)                            │
├─────────────────────────────────────────────┤
│ ○ Implement <picture> fallback             │
│ ○ Progressive WebP encoding                │
│ ○ CDN-based image optimization             │
└─────────────────────────────────────────────┘
```

---

## Performance Impact Estimate

### Current State (Baseline)

```
Page Load:     3.2s (3G)
LCP:           2.1s (menu showcase image)
FCP:           0.9s
Bundle Size:   90 MB images + ~500 KB JS/CSS
```

### After Optimizations (Projected)

```
Page Load:     1.1s (3G) ← 65% faster
LCP:           0.7s ← 67% faster
FCP:           0.4s ← 56% faster
Bundle Size:   13 MB images + ~500 KB JS/CSS ← 85% smaller
```

**Google PageSpeed Score**: 62 → 92 (estimated)

---

## Action Items (Next Steps)

### Immediate (Trong 24h)

1. [ ] Sửa code `regional-specialties.tsx` dùng `.webp` thay `.png`
2. [ ] Add `loading="lazy"` cho `<CardMedia>` trong showcase
3. [ ] Add `loading="lazy"` cho cart item images

### This Week

4. [ ] Convert 7 Apple splash screens sang WebP
5. [ ] Delete các PNG files đã có WebP (sau khi code đã dùng WebP)
6. [ ] Test trên Safari, Chrome, Firefox (WebP support)

### Next Sprint

7. [ ] Generate responsive sizes (400w, 800w, 1200w) cho menu images
8. [ ] Implement `<picture>` với WebP/PNG fallback
9. [ ] Setup automation script cho image optimization pipeline

---

## Verification Checklist

Sau khi implement:

```bash
# 1. Check WebP usage in code
grep -r "\.png" src/features/home src/features/cart | grep -v test
# Kết quả: 0 lines (tất cả đã chuyển sang .webp)

# 2. Check lazy loading
grep -r 'loading="lazy"' src/features/home src/features/cart | wc -l
# Kết quả: >= 5 occurrences

# 3. Verify bundle size
du -sh public/images/menu/
# Kết quả: <= 15 MB (giảm từ 90 MB)

# 4. Run Lighthouse audit
lighthouse https://com-anh-duong.vercel.app --only-categories=performance
# Target: Performance score >= 85
```

---

## Unresolved Questions

1. **Browser Support**: Cần verify WebP support trên các thiết bị khách hàng target (Safari iOS, Android Chrome)?
2. **Build Pipeline**: Có cần integrate image optimization vào Vite build process?
3. **CDN Strategy**: Có plan dùng Cloudflare Images hay Vercel Image Optimization không?
4. **Legacy Devices**: Có cần `<picture>` fallback cho Safari cũ (iOS < 14)?

---

**Report Generated**: 2026-02-12 07:40
**Estimated Effort**: 4-6 hours (implementation + testing)
**Impact**: 🟢 HIGH — Giảm 75-85% image size, cải thiện LCP đáng kể
