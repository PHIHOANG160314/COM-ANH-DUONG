---
title: "PWA Install Prompt Enhancement"
description: "Enhance PWA install prompt with smart triggers, iOS support, and visual polish."
status: completed
priority: P2
effort: 3h
branch: feat/pwa-install-enhancement
tags: [pwa, ui, ios, localization]
created: 2026-02-01
---

# PWA Install Prompt Enhancement Plan

This plan details the enhancement of the `InstallPrompt` component to increase installation rates while respecting user experience, following SEA F&B SOPs.

## Phases

### [Phase 1: Smart Triggers & Localization](./phase-01-smart-triggers.md)
**Status**: Completed
**Goal**: Implement "Smart Trigger" logic (30s delay + 50% scroll) and persistent dismissal state.
- Implement time tracking (30s)
- Implement scroll tracking (50%)
- Update text to Vietnamese
- Persist user choice in localStorage

### [Phase 2: iOS Support & Custom UI](./phase-02-ios-detection-ui.md)
**Status**: Completed
**Goal**: Add support for iOS devices which don't support `beforeinstallprompt`.
- Detect iOS environment
- Create custom iOS instruction modal
- Add detailed Vietnamese instructions (Safari Share -> Add to Home Screen)

### [Phase 3: Visual Polish & Compliance](./phase-03-visual-polish-testing.md)
**Status**: Completed
**Goal**: Final visual polish, animations, and Binh Pháp compliance (Types, Tests).
- Slide-up animations
- Material Design 3 styling
- 100% Type safety
- Unit tests
- Remove tech debt (console.log, TODOs)

## Key Dependencies
- `react-use` (optional, or use custom hooks)
- Material UI v7
- LocalStorage

## Risks
- iOS detection heuristics might change.
- Scroll events might affect performance if not debounced/throttled.
