# Phase 3: Android TWA & Manifest Refinement

## Context
To support Trusted Web Activities (allows publishing to Play Store) and ensure verified app links, we need `assetlinks.json`. We also need to refine the web manifest for better Android integration.

## Requirements
- **Domain Verification**: `.well-known/assetlinks.json` (even if not publishing to store yet, good for future).
- **Manifest**: Categories, Orientation, Shortcuts.

## Implementation Steps

1.  **Refine `vite.config.ts` Manifest**
    - Add `categories`: `['food', 'ordering', 'utilities']`
    - Add `orientation`: `portrait`
    - Add `id`: `/` (consistent ID)
    - Add `shortcuts` (e.g., "Order Now" deep link).

2.  **Create `assetlinks.json`**
    - Create file `public/.well-known/assetlinks.json`.
    - Content template (requires SHA-256 fingerprint if we had an app signing key, for now set up structure).
    - *Note: Since we don't have a native Android app wrapper yet, this is preparatory.*

3.  **Theme Color Consistency**
    - Ensure `meta theme-color` in `index.html` matches `manifest.theme_color`.

## Verification
- [ ] Manifest validation in Chrome DevTools.
- [ ] Verify Shortcuts appear on Android home screen icon long-press (if supported).
