# Phase 3: Polish & Native Experience

**Priority**: MEDIUM
**Status**: In Progress
**Estimated**: 45-60 min

---

## Context Links

- [Main Plan](plan.md)
- [Phase 1 - Bottom Nav](phase-01-bottom-nav-mobile-cards.md)
- [Phase 2 - Mobile Enhancements](phase-02-mobile-enhancements.md)

---

## Overview

**Date**: 2026-02-01 14:39
**Phase**: Polish & Native App Experience
**Completed**: Phase 1 ✅ + Phase 2 ✅

Transform PWA into polished native-like app:
1. Complete dark mode with system preference
2. Smooth page transitions
3. Micro-interactions (button feedback, animations)
4. Touch optimizations (48px targets, haptic feedback)

---

## Key Insights

- Native apps feel polished through micro-interactions
- Dark mode must respect system preference (prefers-color-scheme)
- Touch feedback is critical for mobile UX
- Transitions should be subtle, not distracting (200-300ms)

---

## Requirements

### Functional
1. **Dark Mode** - Toggle + system preference detection + localStorage
2. **Page Transitions** - Fade between routes, slide-in modals
3. **Micro-interactions** - Button press (scale 0.95), cart add bounce, toasts
4. **Touch Optimizations** - 48px minimum, haptic feedback, clear active states

### Non-Functional
- Smooth 60fps animations
- Instant UI feedback (<16ms)
- Persist theme preference
- Works on all mobile devices

---

## Architecture

### Theme System
```
src/shared/theme/
├── theme.ts (update: dark palette)
├── theme-context.tsx (NEW: theme provider)
└── use-theme.tsx (NEW: theme hook)
```

### Transition System
```
src/shared/ui/
├── page-transition.tsx (NEW: route wrapper)
└── slide-transition.tsx (NEW: modal/sheet)
```

### Interaction Hooks
```
src/shared/hooks/
├── use-haptic.tsx (NEW: vibration API)
└── use-button-press.tsx (NEW: scale animation)
```

---

## Related Code Files

### Files to Create
- `src/shared/theme/theme-context.tsx` - Theme provider
- `src/shared/theme/use-theme.tsx` - Theme hook
- `src/shared/ui/page-transition.tsx` - Route transitions
- `src/shared/hooks/use-haptic.tsx` - Haptic feedback
- `src/shared/ui/toast-notification.tsx` - Toast system

### Files to Modify
- `src/shared/theme/theme.ts` - Add dark palette
- `src/app.tsx` - Wrap with ThemeProvider
- `src/shared/ui/app-button.tsx` - Add press animation
- `src/features/cart/components/cart-sheet.tsx` - Slide transition

---

## Implementation Steps

### Step 2.1: Extend Theme with Dark Mode
Update `theme.ts`:
- Add dark palette (background #121212, surface #1e1e1e)
- Primary stays #4ade80
- Text colors with proper contrast
- Component overrides for dark mode

### Step 2.2: Create Theme Context & Hook
Create `theme-context.tsx` + `use-theme.tsx`:
- Detect system preference (prefers-color-scheme)
- localStorage persistence
- Toggle function
- Provide to entire app

### Step 2.3: Create Page Transition Component
Create `page-transition.tsx`:
- Wrap route children with fade transition
- Use CSS transitions (200ms ease-in-out)
- Works with React Router

### Step 2.4: Add Button Press Animation
Update `app-button.tsx`:
- Scale to 0.95 on active
- Spring animation (150ms)
- Haptic feedback on press

### Step 2.5: Create Haptic Feedback Hook
Create `use-haptic.tsx`:
- Check navigator.vibrate support
- Light (10ms), medium (20ms), heavy (30ms)
- Fallback gracefully if unsupported

### Step 2.6: Create Toast Notification System
Create `toast-notification.tsx`:
- Use MUI Snackbar
- Success, error, info, warning variants
- Auto-dismiss (3s default)
- Position bottom center (mobile)

### Step 2.7: Add Cart Add Animation
Update cart add function:
- Trigger haptic on add
- Show toast "Đã thêm vào giỏ"
- Bounce animation on cart badge

---

## Todo List

- [ ] Step 2.1: Extend theme.ts with dark palette
- [ ] Step 2.2: Create ThemeContext + useTheme hook
- [ ] Step 2.3: Create PageTransition component
- [ ] Step 2.4: Add button press animation to AppButton
- [ ] Step 2.5: Create useHaptic hook
- [ ] Step 2.6: Create Toast notification system
- [ ] Step 2.7: Add cart add animation + toast
- [ ] Build and verify no errors
- [ ] Test on mobile (dark mode, transitions, haptics)
- [ ] Verify all touch targets 48px minimum

---

## Success Criteria

- ✅ Dark mode toggles correctly
- ✅ System preference detected on first load
- ✅ Theme persists in localStorage
- ✅ Page transitions smooth (200ms fade)
- ✅ Button press animation feels responsive
- ✅ Haptic feedback works (when supported)
- ✅ Toast notifications appear on actions
- ✅ Cart add shows feedback (toast + haptic)
- ✅ All touch targets meet 48px minimum
- ✅ Build success, no TypeScript errors

---

## Risk Assessment

**Low Risk**:
- MUI theme system is stable
- CSS transitions well-supported

**Medium Risk**:
- Haptic API not supported on all devices
- System preference detection may fail in some browsers

**Mitigation**:
- Graceful fallback when haptic unsupported
- Default to light mode if preference detection fails
- Test on multiple devices/browsers

---

## Security Considerations

- No new security concerns
- localStorage theme preference is benign
- No user input in this phase

---

## Next Steps

After Phase 3 completion:
- Performance audit
- Lighthouse PWA score check
- Final mobile testing (320px-428px)
- Production deployment
