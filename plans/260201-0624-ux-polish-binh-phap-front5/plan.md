---
title: "UI/UX Polish (Binh Pháp Front 5) Enhancements"
description: "Implementation of Zalo Chat, Footer Compliance, Touch Targets, and Visual Polish"
status: pending
priority: P2
effort: 3h
branch: main
tags: [ui, ux, binh-phap, frontend]
created: 2026-02-01
---

# UI/UX Polish (Binh Pháp Front 5) Enhancements

## Overview
This plan addresses the "Front 5: UX Polish" requirements of the Binh Pháp strategy. The goal is to enhance user engagement through direct communication channels (Zalo), build trust with compliance badges, ensure accessibility via touch target audits, and improve visual interactivity.

## Phases

### [Phase 1: Zalo Chat Integration](./phase-01-zalo-fab-integration.md)
- **Status:** Pending
- **Goal:** Enable direct customer support via Zalo.
- **Key Tasks:** Add `ZaloChatFab` to `MainLayout`, configure phone number.

### [Phase 2: Footer Compliance & Trust](./phase-02-footer-compliance.md)
- **Status:** Pending
- **Goal:** Build trust and meet legal requirements.
- **Key Tasks:** Create `FooterCompliance` component with VSATTP + BCT badges, integrate into `MainLayout` footer.

### [Phase 3: Accessibility & Touch Targets](./phase-03-touch-target-audit.md)
- **Status:** Pending
- **Goal:** Ensure mobile usability and A11y compliance.
- **Key Tasks:** Audit clickable elements for 44px min height/width, adjust padding/margins.

### [Phase 4: Visual Polish (Hover Effects)](./phase-04-hover-effects.md)
- **Status:** Pending
- **Goal:** Improve UI interactivity.
- **Key Tasks:** Add hover scale effects to product cards and interactive elements.

### [Phase 5: Testing & Validation](./phase-05-testing-validation.md)
- **Status:** Pending
- **Goal:** Ensure quality and stability.
- **Key Tasks:** Build verification, unit tests run, mobile responsiveness check.

## Key Dependencies
- Existing `ZaloChatFab` component
- Existing `TrustBadges` component
- `OperatingHours` component logic

## Risks
- **Mobile Clutter:** FAB might overlap with other fixed elements (e.g., Cart button on mobile).
- **Performance:** Excessive animations (hover effects) could impact low-end devices.
