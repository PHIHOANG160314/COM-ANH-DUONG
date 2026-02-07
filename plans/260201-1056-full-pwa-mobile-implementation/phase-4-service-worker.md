# Phase 4: Service Worker & Offline Strategy

## Context
`vite-plugin-pwa` handles service worker generation. We need to ensure the caching strategy is appropriate for a food ordering app (dynamic content, static shell).

## Requirements
- **App Shell**: Cache HTML, JS, CSS, Fonts, Icons (CacheFirst/StaleWhileRevalidate).
- **API Data**: NetworkFirst (menu, prices must be fresh).
- **Images**: CacheFirst (menu images) with expiration.

## Implementation Steps

1.  **Configure Workbox in `vite.config.ts`**
    - Define `runtimeCaching` rules.
    - Rule 1: Google Fonts / Static Assets -> `StaleWhileRevalidate`.
    - Rule 2: API calls (`/api/`) -> `NetworkFirst` with `NetworkOnly` fallback if critical, or offline fallback JSON.
    - Rule 3: Images (`/images/`, Supabase Storage) -> `CacheFirst` with expiration (e.g., 7 days, 50 entries).

2.  **Offline Fallback**
    - Ensure the app loads the UI skeleton even when offline.
    - Display a clear "You are offline" message/toast when API calls fail.

## Verification
- [ ] "Offline" mode in Chrome DevTools Network tab.
- [ ] Reload page while offline -> App Shell loads.
- [ ] API calls fail gracefully with UI feedback.
