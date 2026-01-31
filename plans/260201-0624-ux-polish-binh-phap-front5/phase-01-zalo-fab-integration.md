# Phase 1: Zalo Chat Integration

## Context
- **Plan:** [Overview](./plan.md)
- **Component:** `react-app/src/shared/ui/zalo-chat-fab.tsx`
- **Layout:** `react-app/src/shared/layouts/main-layout.tsx`

## Overview
Integrate the Zalo Chat Floating Action Button (FAB) into the main application layout to facilitate direct customer communication.

## Requirements
1.  **Phone Number:** Configure with `0909000900`.
2.  **Visibility:** Visible on all public pages (handled by `MainLayout`).
3.  **Positioning:** Fixed position, bottom-right (ensure no conflict with scrolling or other fixed elements).
4.  **Binh Pháp Compliance:** "Front 5: UX Polish" - Seamless UX for support.

## Implementation Steps
1.  **Update `MainLayout`:**
    - Import `ZaloChatFab` from `@/shared/ui/zalo-chat-fab`.
    - Add `<ZaloChatFab phoneNumber="0909000900" />` to the layout, preferably outside the main container to ensure fixed positioning relative to viewport.
    - Ensure it renders conditionally if needed (e.g., exclude on Admin routes if they share layout, though `MainLayout` seems public-focused).

2.  **Verify Positioning:**
    - Check overlap with "Back to Top" buttons or mobile browser bars.
    - Ensure `z-index` is sufficient.

## Success Criteria
- [ ] Zalo FAB appears on all pages using `MainLayout`.
- [ ] Clicking FAB opens Zalo chat with correct phone number.
- [ ] No visual overlap with critical UI elements.

## Todo List
- [ ] Edit `react-app/src/shared/layouts/main-layout.tsx`
- [ ] Verify `ZaloChatFab` props interface matches requirement.
