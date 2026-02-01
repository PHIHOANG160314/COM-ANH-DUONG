# Phase 2: Mobile Enhancements

**Priority**: HIGH
**Status**: In Progress
**Estimated**: 45-60 min

---

## Context Links

- [Main Plan](plan.md)
- [Phase 1 - Bottom Nav](phase-01-bottom-nav-mobile-cards.md)

---

## Overview

**Date**: 2026-02-01 14:29
**Phase**: Mobile Enhancements following SEA F&B standards
**Completed**: Phase 1 ✅ (BottomNavigation, CartSheet, Brand assets)

Enhance mobile experience with:
1. Pull-to-refresh gesture
2. Skeleton loading states
3. Horizontal scroll category chips
4. Optimized image loading

---

## Key Insights

- SEA F&B apps (GrabFood, ShopeeFood) use pull-to-refresh extensively
- Skeleton states reduce perceived loading time
- Horizontal category chips save vertical space on mobile
- Image optimization critical for mobile data usage

---

## Requirements

### Functional
1. **Pull-to-Refresh** - Reload menu data on pull gesture
2. **Skeleton Loading** - Show skeletons during data fetch
3. **Category Chips** - Horizontal scrollable filter chips
4. **Image Optimization** - Lazy load with blur placeholder

### Non-Functional
- Touch-friendly (min 44x44px targets)
- Smooth 60fps animations
- Works on 320px width (iPhone SE)
- Maintains dark mode support

---

## Architecture

### Component Structure
```
src/features/menu/
├── components/
│   ├── menu-grid.tsx (update: skeleton states)
│   ├── menu-card.tsx (update: lazy images)
│   ├── menu-skeleton.tsx (NEW)
│   └── category-chips.tsx (NEW)
└── hooks/
    └── use-pull-to-refresh.tsx (NEW)
```

### Data Flow
1. User pulls down → trigger refresh
2. Show skeletons while loading
3. Fetch menu data from Supabase
4. Replace skeletons with real data
5. Lazy load images on scroll

---

## Related Code Files

### Files to Modify
- `src/pages/customer/menu-page.tsx` - Add pull-to-refresh
- `src/features/menu/components/menu-grid.tsx` - Add skeleton states
- `src/features/menu/components/menu-card.tsx` - Lazy images

### Files to Create
- `src/features/menu/components/menu-skeleton.tsx` - Skeleton component
- `src/features/menu/components/category-chips.tsx` - Horizontal chips
- `src/features/menu/hooks/use-pull-to-refresh.tsx` - Pull refresh hook

---

## Implementation Steps

### Step 2.1: Create Menu Skeleton Component
Create `menu-skeleton.tsx` with MUI Skeleton:
- Card skeleton matching MenuCard layout
- Image skeleton (horizontal layout for mobile)
- Text skeletons for title, price, category
- Grid of 6 skeletons during loading

### Step 2.2: Create Category Chips Component
Create `category-chips.tsx`:
- Horizontal scroll container
- Hide scrollbar, keep swipe
- Chip size: 44px height minimum
- Active state with primary color
- Touch-friendly spacing (8px gap)

### Step 2.3: Create Pull-to-Refresh Hook
Create `use-pull-to-refresh.tsx`:
- Listen for touchstart, touchmove, touchend
- Calculate pull distance
- Trigger refresh at threshold (80px)
- Show loading indicator
- Reset on complete

### Step 2.4: Update Menu Grid
Update `menu-grid.tsx`:
- Add loading state
- Show MenuSkeleton during load
- Pass loading prop from parent

### Step 2.5: Update Menu Card
Update `menu-card.tsx`:
- Lazy load images with Intersection Observer
- Blur placeholder during load
- WebP format with PNG fallback
- Optimize image component

### Step 2.6: Update Menu Page
Update `menu-page.tsx`:
- Integrate pull-to-refresh hook
- Add CategoryChips component
- Manage loading state
- Trigger menu refetch on refresh

---

## Todo List

- [ ] Step 2.1: Create MenuSkeleton component
- [ ] Step 2.2: Create CategoryChips component
- [ ] Step 2.3: Create usePullToRefresh hook
- [ ] Step 2.4: Update MenuGrid with skeleton states
- [ ] Step 2.5: Update MenuCard with lazy images
- [ ] Step 2.6: Update MenuPage with pull-to-refresh
- [ ] Build and verify no errors
- [ ] Test on mobile (320px-428px)
- [ ] Verify touch targets (min 44px)

---

## Success Criteria

- ✅ Pull-to-refresh works on menu page
- ✅ Skeleton states show during loading
- ✅ Category chips scroll horizontally
- ✅ Images lazy load with blur placeholder
- ✅ All touch targets meet 44x44px minimum
- ✅ Smooth animations (60fps)
- ✅ Works on iPhone SE (320px)
- ✅ Build success, no TypeScript errors

---

## Risk Assessment

**Low Risk**:
- MUI Skeleton is stable
- Lazy loading is standard practice

**Medium Risk**:
- Custom pull-to-refresh may conflict with browser scroll
- Horizontal scroll may interfere with page scroll

**Mitigation**:
- Test pull-to-refresh on actual devices
- Use CSS overflow-x carefully
- Prevent body scroll during pull gesture

---

## Security Considerations

- No new security concerns
- Image lazy loading from trusted sources only
- No user input in this phase

---

## Next Steps

After Phase 2 completion:
- Phase 3: Polish & Animations
- Page transitions
- Haptic feedback
- Shimmer effects
