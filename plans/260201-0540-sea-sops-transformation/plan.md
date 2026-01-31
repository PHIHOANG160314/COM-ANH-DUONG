---
title: "SEA F&B SOPs Transformation: Conversion & Trust"
description: "Implementation of COD prominence, Zalo widget, Operating Hours, and Trust Badges to align with Southeast Asian F&B best practices."
status: completed
priority: P1
effort: 8h
branch: main
tags: [ux, cod, zalo, trust, conversion]
created: 2026-02-01
---

## Overview

This plan transforms the Cơm Ánh Dương user experience to match standard Southeast Asian F&B SOPs, focusing on friction reduction (COD), local communication channels (Zalo), and trust building.

## Phases

- **[x] Phase 1: COD Prominence** (`phase-01-cod-prominence.md`)
    - Make COD default selected.
    - Add "Phổ biến" badge and green accents.
    - Update payment selector UI in checkout.

- **[x] Phase 2: Zalo Integration** (`phase-02-zalo-integration.md`)
    - Implement Zalo FAB (Floating Action Button).
    - Deep link to Zalo OA/Phone.
    - Replace/Update existing widget if necessary.

- **[x] Phase 3: Operating Hours** (`phase-03-operating-hours.md`)
    - Display 10:00 - 22:00 daily status.
    - Traffic light indicators (Open/Closing/Closed).
    - Handle checkout disabling when closed.

- **[x] Phase 4: Trust Badges** (`phase-04-trust-badges.md`)
    - Add footer/checkout trust signals.
    - Implement "Food Safety", "COD", "Fresh" badges.
    - Verify tech debt cleanup in modified files.

- **[x] Phase 5: Testing & Validation** (`phase-05-testing-validation.md`)
    - Verify all flows on Mobile/Desktop.
    - Tech debt audit (console logs, types).
    - Final UI polish.

## Dependencies
- Existing `zalo-widget.tsx` needs review.
- `payment-method-selector.tsx` refactor.
