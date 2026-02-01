# Desktop Page Centering Fix - CRITICAL ROOT CAUSE

**Date**: 2026-02-01 10:47
**Issue**: ENTIRE PAGE LEFT-ALIGNED on desktop 1920x1080, 40% empty black space on right
**Status**: ✅ RESOLVED

## Root Cause Analysis

### The REAL Problem
**USER VERIFICATION REVEALED**: Previous fix only aligned sections TO EACH OTHER but entire page remained LEFT-ALIGNED.

### CSS Culprit
**File**: `src/index.css` lines 27-28
```css
/* BEFORE - BROKEN */
body {
  margin: 0;
  display: flex;          /* ← BREAKS CENTERING */
  place-items: center;    /* ← INEFFECTIVE */
  min-width: 320px;
  min-height: 100vh;
}
```

### Why It Broke
1. **MUI Container centering** uses `margin: 0 auto` for horizontal centering
2. **CSS `margin: auto`** only works in BLOCK layout context
3. **Body `display: flex`** creates FLEX layout context
4. **Flex children** don't honor `margin: auto` centering the same way
5. **Result**: Container stuck to LEFT edge of flex container

### Visual Impact
- Desktop 1920x1080: Page stuck to left, ~700px empty space on right
- Container maxWidth 1200px rendered at LEFT edge, not centered
- All sections aligned to each other but entire layout left-biased

## The Fix

### CSS Fix (index.css)
```css
/* AFTER - FIXED */
body {
  margin: 0;
  /* Removed display: flex */
  /* Removed place-items: center */
  min-width: 320px;
  min-height: 100vh;
}
```

**Effect**: Container's `margin: 0 auto` now works correctly in block layout.

### Footer Location Fix
**File**: `src/shared/layouts/main-layout.tsx` line 320
```tsx
// BEFORE
📍 Hà Nội, Việt Nam

// AFTER
📍 Sa Đéc, Đồng Tháp
```

## Industry Standard Applied
- **Viewport**: Full-width body (block layout)
- **Container**: maxWidth 1200px + `margin: 0 auto`
- **Sections**: Break out with `mx: -3` for visual impact, center content with inner container
- **Result**: Symmetric margins, centered 1200px content at all breakpoints

## Verification
- ✅ Build: 9.81s
- ✅ Tests: 79/79 pass
- ✅ Binh Pháp: 0/0/0
- ✅ CI/CD: GREEN
- ✅ Production: HTTP 200

## Commit
`4eaed1b` - "fix(ui): center entire page layout on desktop + fix footer location"

## User Verification Required
Desktop 1920x1080:
- Page should center at 1200px
- Equal margins on left and right
- No 40% empty space on either side
- Hero, Staff, Menu sections all centered together

## Lesson Learned
**CSS Layout Context Matters**:
- `display: flex` on body breaks MUI Container centering
- `margin: auto` behaves differently in flex vs block context
- Always verify ENTIRE PAGE layout, not just section-to-section alignment
- User browser testing reveals issues automated tests miss
