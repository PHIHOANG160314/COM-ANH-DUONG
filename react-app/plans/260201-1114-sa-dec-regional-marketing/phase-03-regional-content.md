---
title: "Phase 3: Regional Content Section"
description: "Add a new section showcasing Sa Đéc specialties"
status: completed
priority: P2
effort: 1h
branch: main
tags: [ui, new-feature, content]
created: 2026-02-01
---

# Phase 3: Regional Content Section

## Overview
Add a new section `RegionalSpecialties` to the Home page to highlight specific Sa Đéc dishes, reinforcing the local brand identity.

## Requirements
- New component: `src/features/home/components/regional-specialties.tsx`
- Display 3 cards:
  1.  **Hủ tiếu Sa Đéc**: Famous distinct noodle soup.
  2.  **Cá lóc nướng cuốn lá sen**: Signature dish of the lotus land.
  3.  **Bánh phồng tôm Sa Giang**: Local snack/side dish.
- Layout: Responsive grid (1 col mobile, 3 cols desktop).
- Styling: Consistent with `HeroSection` (Material UI).

## Related Files
- `src/features/home/components/regional-specialties.tsx` (New)
- `src/features/home/home-page.tsx` (Update to include new section)

## Implementation Steps

1.  **Create Component**
    -   Define data array for the 3 specialties (image placeholder, title, description).
    -   Use `Grid`, `Card`, `CardMedia`, `CardContent`.
    -   Add "Vùng đất Sen Hồng" header to the section.

2.  **Integrate into Home Page**
    -   Import `RegionalSpecialties` in `HomePage`.
    -   Place it below `HeroSection`.

## Todo List
- [x] Create `RegionalSpecialties` component
- [x] Implement responsive grid layout
- [x] Add specialty content
- [x] Add component to `HomePage`

## Success Criteria
- New section appears on Home page.
- 3 specialty cards are visible.
- Responsive design works on mobile and desktop.
