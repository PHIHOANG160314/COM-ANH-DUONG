# Phase 2: iOS Optimization

## Context
iOS requires specific `<meta>` tags and `<link>` tags in `index.html` to function as a standalone app. Unlike Android which reads fully from `manifest.webmanifest`, iOS Safari relies heavily on these HTML tags.

## Requirements
- **Status Bar**: `black-translucent` or `default` (match theme).
- **Title**: Short app name.
- **Splash Screens**: Pre-generated images for various viewport sizes to prevent white screen on launch.

## Implementation Steps

1.  **Update `index.html`**
    - Add `apple-mobile-web-app-capable` content="yes"
    - Add `apple-mobile-web-app-status-bar-style` content="black-translucent"
    - Add `apple-mobile-web-app-title` content="Cơm Ánh Dương"

2.  **Generate Splash Screens**
    - Use a tool or script to generate splash screens for common iPhone resolutions.
    - *Note: For MVP, we can generate a single widespread size or a few critical ones, or use a generator tool.*
    - Add `<link rel="apple-touch-startup-image" ...>` tags to `index.html`.

3.  **Review `ios-install-modal.tsx`**
    - Ensure instructions are clear and accurate for current iOS versions (Share -> Add to Home Screen).
    - Verify Vietnamese copy is natural.

## Verification
- [ ] Inspect `index.html` for meta tags.
- [ ] Open in Safari on iOS Simulator or Device.
- [ ] Verify "Add to Home Screen" adds correct icon.
- [ ] Verify launch shows splash screen (not white screen).
- [ ] Verify status bar blends with app header.
