# Phase 2: Footer Compliance & Trust

## Context
- **Plan:** [Overview](./plan.md)
- **Component:** `react-app/src/shared/ui/trust-badges.tsx`
- **Layout:** `react-app/src/shared/layouts/main-layout.tsx`

## Overview
Add compliance and trust badges to the footer to reassure customers and meet regulatory standards for F&B e-commerce.

## Requirements
1.  **Components:**
    - **VSATTP:** Vệ Sinh An Toàn Thực Phẩm certification badge.
    - **BCT:** Bộ Công Thương notification badge (if applicable/mocked).
2.  **Location:** Bottom of the footer in `MainLayout`.
3.  **Component Creation:** Create `footer-compliance.tsx` (or update existing footer) to house these badges cleanly.
4.  **Integration:** Existing `TrustBadges` component should be utilized or extended.

## Implementation Steps
1.  **Analyze `TrustBadges`:**
    - Check if `react-app/src/shared/ui/trust-badges.tsx` already contains the necessary badges.
    - If not, update it to include VSATTP and BCT style badges.

2.  **Create/Update Footer Section:**
    - In `react-app/src/shared/layouts/main-layout.tsx`, locate the footer `<Box component="footer">`.
    - Insert the Trust/Compliance section above the copyright line.
    - Use `FooterCompliance` or direct component insertion.

3.  **Styling:**
    - Ensure badges are monochrome or unobtrusive to match the dark footer theme (`#1a1a2e`).
    - Flex layout for alignment.

## Success Criteria
- [ ] Footer displays Trust/Compliance badges.
- [ ] Layout is responsive (stacks on mobile, row on desktop).
- [ ] Design matches existing footer aesthetic.

## Todo List
- [ ] Check `react-app/src/shared/ui/trust-badges.tsx` content.
- [ ] Implement/Import badges in `MainLayout` footer.
