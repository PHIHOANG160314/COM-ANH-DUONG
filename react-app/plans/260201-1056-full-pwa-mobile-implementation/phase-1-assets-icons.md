# Phase 1: Assets & Icons Generation

## Context
Current PWA setup is missing physical icon files. `vite-plugin-pwa` is configured to look for `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, and `maskable-icon-512x512.png`, but these do not exist in the `public` folder.

## Requirements
- **Theme Color**: `#4ade80` (Green)
- **Background**: `#ffffff` (White)
- **Base Asset**: Use `react.svg` or generate a new "Cơm Ánh Dương" logo/icon. *Recommendation: Create a simple, clean icon using ImageMagick if official logo unavailable.*

## Implementation Steps

1.  **Create Base Icon**
    - Create a high-res base icon (1024x1024) PNG.
    - Design: "CAD" monogram or "Rice Bowl" icon on #4ade80 background.

2.  **Generate Standard Icons**
    - `public/pwa-64x64.png`
    - `public/pwa-192x192.png`
    - `public/pwa-512x512.png`

3.  **Generate Specialized Icons**
    - `public/maskable-icon-512x512.png` (Safe area padding)
    - `public/apple-touch-icon.png` (180x180, no transparency, square)
    - `public/favicon.ico` (16x16, 32x32)
    - `public/mask-icon.svg` (Monochrome for Safari pinned tab)

4.  **Update Configuration**
    - Verify `vite.config.ts` matches generated filenames.
    - Ensure `includeAssets` lists all non-manifest icons.

## Verification
- [ ] Files exist in `public/` folder.
- [ ] `vite.config.ts` points to correct files.
- [ ] Chrome DevTools > Application > Manifest shows icons correctly.
