# Phase 1: Core Mobile Components

**Priority**: CRITICAL
**Status**: In Progress
**Target**: 60-90 min

---

## Task 1: Bottom Navigation Component ✅

**File**: `src/shared/ui/bottom-navigation.tsx`

**Requirements**:
- Fixed bottom positioning
- 56px height + safe-area-inset-bottom
- 4 items: Home, Menu, Cart (with badge), Profile
- Active state styling (primary color + filled icons)
- Only visible on mobile (< 900px)

**Implementation**:
```tsx
interface BottomNavItem {
  label: string;
  icon: ReactElement;
  activeIcon: ReactElement;
  path: string;
  badge?: number;
}
```

---

## Task 2: Update Main Layout

**File**: `src/shared/layouts/main-layout.tsx`

**Changes**:
- Hide AppBar on mobile (< 900px)
- Add BottomNavigation component
- Add padding-bottom to content (56px + safe area)
- Remove drawer navigation on mobile

---

## Task 3: Mobile-Optimized Menu Cards

**File**: `src/features/menu/components/menu-card.tsx`

**Desktop (current)**:
- Vertical card
- Image top
- Info bottom

**Mobile (new)**:
- Horizontal card on small screens
- Image left (80x80px)
- Info right
- Quick add button (+) always visible
- Touch target 48px minimum

---

## Task 4: Cart Sheet Drawer

**File**: `src/features/cart/components/cart-sheet.tsx`

**Requirements**:
- Slide up from bottom (not side drawer)
- SwipeableDrawer from MUI
- Sticky checkout button at bottom
- Swipe down to dismiss
- Backdrop overlay

**Replace**: Current CartDrawer (side drawer)

---

## Task 5: Touch Target Verification

**Check all components**:
- Buttons: minimum 44x44px
- Add to cart: 48px height
- Nav items: 56px height
- Icon buttons: 48x48px

---

## Implementation Order

1. Create BottomNavigation component
2. Create CartSheet component
3. Update main-layout.tsx
4. Refactor menu-card.tsx
5. Test on mobile (320px - 428px)
6. Commit and push

---

## Files to Modify

- NEW: `src/shared/ui/bottom-navigation.tsx`
- NEW: `src/features/cart/components/cart-sheet.tsx`
- EDIT: `src/shared/layouts/main-layout.tsx`
- EDIT: `src/features/menu/components/menu-card.tsx`
- EDIT: `src/pages/customer/home-page.tsx` (use CartSheet)

---

## Success Criteria

- ✅ Bottom nav shows on mobile only
- ✅ Cart badge displays item count
- ✅ Navigation works (Home, Menu, Cart, Profile)
- ✅ Menu cards horizontal on mobile
- ✅ Cart sheet slides up from bottom
- ✅ All touch targets meet 44px minimum
- ✅ Build success, no TypeScript errors
