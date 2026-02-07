# Phase 3: Front 3 - Performance

## Context
Optimize build size and runtime performance. The initial audit flagged a large vendor chunk (1.68MB).

## Requirements
- Optimize `vite.config.ts` to split chunks effectively.
- Ensure `React.lazy` is used for route-based code splitting.
- Build time must remain under 10s.

## Identified Issues
- Vendor chunk size is 1.68MB (504KB gzipped), which triggers a warning.

## Implementation Steps

1. **Optimize Vite Config**
   - [ ] Modify `vite.config.ts` to configure `build.rollupOptions.output.manualChunks`.
   - [ ] Split large libraries (e.g., `react-vendor`, `ui-vendor`) into separate chunks.

2. **Verify Code Splitting**
   - [ ] Check `src/routes/index.tsx` (or equivalent) to ensure `React.lazy` is used for page components.

3. **Image Optimization**
   - [ ] Verify that images are optimized (WebP format preference).

## Verification
- Run `npm run build` and check output.
- Confirm vendor chunk size is reduced or split.
- Confirm build time < 10s.
