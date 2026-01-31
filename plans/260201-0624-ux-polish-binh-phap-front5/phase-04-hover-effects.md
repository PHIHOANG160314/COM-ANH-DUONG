# Phase 4: Visual Polish (Hover Effects)

## Context
- **Plan:** [Overview](./plan.md)
- **Target:** Product Cards (`AppCard` or similar) and key interactive elements.

## Overview
Add subtle hover scale effects to product cards and other key elements to provide better visual feedback and a more polished "app-like" feel.

## Requirements
1.  **Effect:** `transform: scale(1.02)` or similar on hover.
2.  **Transition:** Smooth transition (`0.2s` or `0.3s`).
3.  **Target Components:**
    - Product Cards (listings).
    - Category Cards (if any).
    - Feature buttons.

## Implementation Steps
1.  **Identify Product Card Component:**
    - Likely `react-app/src/shared/ui/app-card.tsx` or feature-specific card.
    - Based on file list, `app-card.tsx` is the generic one.

2.  **Apply Styles:**
    - Add `sx` prop or styled component definition:
      ```javascript
      {
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        }
      }
      ```

3.  **Review other elements:**
    - Check if other clickable cards need this treatment.

## Success Criteria
- [ ] Product cards elevate/scale slightly on hover.
- [ ] Transitions are smooth.
- [ ] No layout jitter during transition.

## Todo List
- [ ] Update `react-app/src/shared/ui/app-card.tsx` (if used for products).
- [ ] Verify effect on product listing page (`/menu`).
