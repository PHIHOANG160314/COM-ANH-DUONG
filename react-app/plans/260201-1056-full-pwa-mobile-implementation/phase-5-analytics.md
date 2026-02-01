# Phase 5: Analytics & Tracking

## Context
Understanding how users install and interact with the PWA is crucial. We need to hook into PWA events.

## Requirements
- Track `beforeinstallprompt` outcome (Accepted/Dismissed).
- Track standalone launch.

## Implementation Steps

1.  **Update `usePwaInstallPrompt.ts`**
    - Add analytics logging (e.g., `console.log` or a proper analytics service if available) when `userChoice` resolves.

2.  **Detect Standalone Launch**
    - In `App.tsx` or main entry, check `window.matchMedia('(display-mode: standalone)').matches`.
    - Log event "App Launched (PWA)".

## Verification
- [ ] Check logs/console when accepting install prompt.
- [ ] Check logs/console when launching installed app.
