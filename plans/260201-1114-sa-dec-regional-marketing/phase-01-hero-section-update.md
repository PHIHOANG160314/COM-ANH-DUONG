---
title: "Phase 1: Hero Section Regional Update"
description: "Update Hero section with Sa Đéc branding and imagery"
status: completed
priority: P2
effort: 45m
branch: main
tags: [ui, branding, hero]
created: 2026-02-01
---

# Phase 1: Hero Section Regional Update

## Overview
Update the `HeroSection` component to replace generic messaging with specific Sa Đéc cultural references.

## Requirements
- Change tagline to: "Hương vị Sa Đéc - Vùng đất Sen Hồng" or similar.
- Update sub-tagline to mention "Đặc sản miền Tây".
- Update feature chips to highlight:
  - "Làng hoa Sa Đéc" (Flower Village)
  - "Giao hàng tận nơi" (Delivery)
  - "Chuẩn vị miền Tây" (Authentic Western Taste)

## Related Files
- `src/features/home/components/hero-section.tsx`

## Implementation Steps

1.  **Update Tagline**
    -   Modify `Typography` variant `h2` content to "🍚 Cơm Ánh Dương - Sa Đéc".
    -   Modify `Typography` variant `h5` content to "Hương vị Vùng đất Sen Hồng - Giao nhanh tận nơi 🛵".

2.  **Update Feature Chips**
    -   Replace existing chips with:
        -   Icon: `LocalFlorist` (for Flower Village), Label: "Gần Làng hoa 700ha"
        -   Icon: `LocalDining`, Label: "Chuẩn vị miền Tây"
        -   Icon: `AccessTime`, Label: "Giao nhanh Sa Đéc"

3.  **Update Info Cards (Grid)**
    -   Update Address card to: "Làng hoa Sa Đéc, Đồng Tháp".
    -   Ensure icons match the content.

## Todo List
- [x] Update main heading and tagline
- [x] Replace feature chips with Sa Đéc specific ones
- [x] Update address in the info grid
- [x] Verify responsiveness and animations

## Success Criteria
- Hero section clearly identifies the location as Sa Đéc.
- "Vùng đất Sen Hồng" is mentioned.
- Layout remains broken-proof on mobile.
