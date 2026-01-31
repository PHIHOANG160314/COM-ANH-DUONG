# Phase 3: Accessibility & Touch Targets

## Context
- **Plan:** [Overview](./plan.md)
- **Target:** All interactive elements (Buttons, Links, Inputs).

## Overview
Audit and adjust the UI to ensure all touch targets meet the minimum size of 44x44 CSS pixels, improving usability on mobile devices and meeting accessibility standards.

## Requirements
1.  **Standard:** Minimum touch target size of 44px.
2.  **Scope:**
    - Navigation items (Mobile drawer).
    - Header buttons (Cart, Profile, Login).
    - Footer links.
    - Product card actions (Add to cart).
3.  **Approach:** Use CSS padding or `min-height`/`min-width` properties.

## Implementation Steps
1.  **Header & Nav:**
    - Inspect `IconButton` and `Button` usage in `MainLayout`. MUI standard is usually 40px, may need bumping to `size="large"` or custom padding.
    - Inspect `ListItemButton` in Mobile Drawer.

2.  **Footer Links:**
    - Update footer link typography/box to ensure adequate spacing/padding between links. Currently, they are text links; adding vertical padding makes them easier to tap.

3.  **Global Overrides (Optional):**
    - Consider Theme overrides for `MuiButton` and `MuiIconButton` if widespread issues are found.

## Success Criteria
- [ ] All primary interactive elements have >= 44px hit area.
- [ ] No layout breakage due to increased sizes.

## Todo List
- [ ] Audit `MainLayout` header buttons.
- [ ] Audit Mobile Drawer list items.
- [ ] Audit Footer links.
- [ ] Apply CSS fixes.
