---
title: "Phase 09: PWA & Offline Support"
description: "Implement Progressive Web App capabilities and offline-first strategies using Service Workers and IndexedDB."
status: completed
priority: P2
effort: 3 days
branch: feat/pwa-offline
tags: [pwa, offline, workbox, indexeddb]
created: 2026-01-30
---

# Phase 09: PWA & Offline Support

## Context Links
- [React 19 + Vite Best Practices](../reports/researcher-260130-1958-react19-vite-best-practices.md)

## Overview
Ensure the application is installable on devices (Staff Tablets, Shipper Phones) and functions resiliently under poor network conditions.

## Key Insights
- **Vite PWA Plugin**: Simplifies manifest and service worker generation.
- **TanStack Query Persistence**: Can persist cache to localStorage/IndexedDB automatically.

## Requirements
### Functional
- "Add to Home Screen" prompt.
- App loads while offline (static assets).
- Cached data displays while offline.
- Graceful error handling for actions requiring online connection.

## Architecture
- **Tooling**: `vite-plugin-pwa`.
- **Caching**: Workbox (Assets), TanStack Query Persist (Data).

## Related Code Files
- `vite.config.ts`
- `src/main.tsx`

## Implementation Steps
1.  **Vite PWA**: Configure `vite-plugin-pwa` with manifest (Icons, Name, Theme Color).
2.  **Service Worker**: Generate SW to cache index.html, JS, CSS, and Fonts.
3.  **Data Persistence**: Configure `PersistQueryClientProvider` for TanStack Query to save fetched menus/orders to localStorage.
4.  **Network Status**: Create `useNetworkStatus` hook to show "Offline" banner.

## Todo List
- [x] Configure `vite-plugin-pwa`
- [x] Create `manifest.webmanifest`
- [x] Generate Service Worker
- [x] Setup TanStack Query Persistence
- [x] Implement Offline Notification UI
- [x] Test Offline Mode (DevTools Network Tab)

## Success Criteria
- App loads with WiFi turned off (after first visit).
- "Install App" button appears on mobile.

## Risk Assessment
- **Risk**: Stale data in cache.
  - **Mitigation**: Configure appropriate `staleTime` and cache invalidation strategies in Query Client.

## Next Steps
- Proceed to [Phase 10: Testing & Deployment](./phase-10-testing-deployment.md).
