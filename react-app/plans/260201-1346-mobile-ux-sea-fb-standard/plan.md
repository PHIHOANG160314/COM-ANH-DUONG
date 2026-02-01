# Mobile UI/UX WOW - SEA F&B App Standard

**Date**: 2026-02-01 13:46
**Goal**: Transform PWA into native app-like experience following SEA F&B standards (GrabFood, ShopeeFood, Gojek)
**Status**: Phase 1 - In Progress

---

## Overview

Transform desktop-first PWA into mobile-first F&B app with:
- Bottom navigation (native app feel)
- Optimized touch targets (44x44px minimum)
- Mobile-optimized menu cards
- Cart sheet drawer
- Pull-to-refresh
- Complete dark mode
- SEA-style animations

---

## Phase Breakdown

### Phase 1: Core Mobile Components (HIGH IMPACT) 🎯
**Priority**: Critical
**Estimated**: 60-90 min

Tasks:
1. ✅ Create BottomNavigation component (Home, Menu, Cart, Profile)
2. ✅ Update main-layout.tsx for mobile bottom nav
3. ✅ Refactor menu cards for mobile-first layout
4. ✅ Create cart sheet bottom drawer
5. ✅ Verify touch targets 44x44px minimum

### Phase 2: Mobile Enhancements
**Priority**: High
**Estimated**: 45-60 min

Tasks:
1. Add pull-to-refresh to menu page
2. Implement skeleton loading states
3. Complete dark mode (all components)
4. Horizontal scroll category chips

### Phase 3: Polish & Animations
**Priority**: Medium
**Estimated**: 30-45 min

Tasks:
1. Page transition animations
2. Button haptic feedback (scale)
3. Skeleton shimmer effect
4. Test all breakpoints (320px - 428px)

---

## Technical Specs

### Breakpoints
```typescript
320px  // iPhone SE - minimum
375px  // iPhone X - optimal
390px  // iPhone 14
428px  // iPhone 14 Pro Max
```

### Touch Targets
- Minimum: 44x44px (iOS Human Interface Guidelines)
- Buttons: 48px height
- FAB: 56px diameter
- Bottom nav items: 56px height

### Bottom Navigation
- Height: 56px + safe-area-inset-bottom
- Items: Home, Menu, Cart (badge), Profile
- Active state: primary color + filled icon
- Position: fixed bottom

### Colors (Dark Mode)
- Background: #121212
- Surface: #1e1e1e
- Primary: #4ade80
- Text primary: rgba(255,255,255,0.87)
- Text secondary: rgba(255,255,255,0.60)

---

## Success Criteria

- ✅ Bottom nav works on all mobile devices
- ✅ All touch targets meet 44x44px minimum
- ✅ Menu cards optimized for mobile (image left, info right)
- ✅ Cart drawer slides up from bottom
- ✅ Dark mode complete with proper contrast
- ✅ Smooth animations (60fps)
- ✅ Works on 320px width (iPhone SE)

---

## Links

- [Phase 1 Details](phase-01-bottom-nav-mobile-cards.md)
- [Phase 2 Details](phase-02-enhancements.md)
- [Phase 3 Details](phase-03-polish-animations.md)
