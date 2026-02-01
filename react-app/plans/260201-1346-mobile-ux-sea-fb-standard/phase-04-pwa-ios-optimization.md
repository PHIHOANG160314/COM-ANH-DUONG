# Phase 4: PWA Enhancement & iOS Optimization

**Date**: 2026-02-01 15:07
**Priority**: High
**Status**: In Progress
**Estimated Time**: 45-60 min

---

## Context Links

- [Main Plan](plan.md)
- [Phase 1: Bottom Nav](phase-01-bottom-nav-mobile-cards.md)
- [Phase 2: Mobile Enhancements](phase-02-mobile-enhancements.md)
- [Phase 3: Polish & Animations](phase-03-polish-animations.md)

---

## Overview

Enhance PWA capabilities and optimize for iOS Safari with:
- iOS splash screens (all device sizes)
- Install prompts (iOS + Android)
- Offline fallback page
- iOS-specific meta tags
- A2HS (Add to Home Screen) optimization

**Current Status**: PWA configured with vite-plugin-pwa, manifest ready, service worker auto-updating

---

## Key Insights

1. **iOS Safari Quirks**: Requires specific meta tags for proper PWA behavior
2. **Splash Screens**: iOS needs static images for each device resolution
3. **Install Prompts**: Different UX for iOS (manual) vs Android (BeforeInstallPrompt)
4. **Offline Support**: Service worker already precaching, need fallback UI
5. **Safe Area**: iOS notch/Dynamic Island requires safe-area-inset handling

---

## Requirements

### Functional
- ✅ PWA manifest with shortcuts (already implemented)
- ✅ Service worker auto-update (already implemented)
- 🔲 iOS splash screens for all devices
- 🔲 Install prompt component (iOS + Android)
- 🔲 Offline fallback page
- 🔲 iOS meta tags (status bar, viewport, web app capable)
- 🔲 Safe area handling for notch devices

### Non-Functional
- Fast install prompt detection (<500ms)
- Splash screens optimized (webp format)
- Offline page <10KB
- No layout shift on iOS safe areas

---

## Architecture

### Component Structure
```
src/
├── shared/
│   ├── ui/
│   │   ├── install-prompt.tsx       # A2HS prompt (iOS + Android)
│   │   └── offline-fallback.tsx     # Offline page component
│   └── hooks/
│       └── use-install-prompt.tsx   # BeforeInstallPrompt hook
└── pages/
    └── offline.tsx                  # Offline route
```

### iOS Splash Screens
```
public/
├── apple-splash-2048-2732.png      # iPad Pro 12.9"
├── apple-splash-1668-2388.png      # iPad Pro 11"
├── apple-splash-1536-2048.png      # iPad Pro 10.5"
├── apple-splash-1242-2688.png      # iPhone 14 Pro Max
├── apple-splash-1170-2532.png      # iPhone 14 Pro
├── apple-splash-1125-2436.png      # iPhone X/11 Pro
└── apple-splash-750-1334.png       # iPhone SE
```

### Meta Tags (index.html)
```html
<!-- iOS PWA -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Cơm Ánh Dương">

<!-- Splash screens -->
<link rel="apple-touch-startup-image" href="/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px)">
<!-- ... more splash screens ... -->

<!-- Safe area -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

---

## Related Code Files

### To Modify
- `index.html` - Add iOS meta tags and splash screen links
- `vite.config.ts` - Add offline fallback route to workbox config
- `src/app/providers/app-provider.tsx` - Add install prompt provider

### To Create
- `src/shared/ui/install-prompt.tsx`
- `src/shared/hooks/use-install-prompt.tsx`
- `src/pages/offline.tsx`
- `public/apple-splash-*.png` (7 files)

---

## Implementation Steps

### 1. Generate iOS Splash Screens
```bash
# Use PWA Asset Generator or manual creation
npx pwa-asset-generator public/pwa-512x512.png public/ \
  --splash-only \
  --background "#ffffff" \
  --type png \
  --quality 100
```

### 2. Add iOS Meta Tags to index.html
```html
<head>
  <!-- Existing meta tags -->

  <!-- iOS PWA Support -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Cơm Ánh Dương">

  <!-- Safe area for notch -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

  <!-- iOS splash screens -->
  <link rel="apple-touch-startup-image" href="/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/apple-splash-1668-2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/apple-splash-1242-2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/apple-splash-1170-2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/apple-splash-1125-2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
  <link rel="apple-touch-startup-image" href="/apple-splash-750-1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
</head>
```

### 3. Create Install Prompt Hook
```typescript
// src/shared/hooks/use-install-prompt.tsx
export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Check if already installed
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(installed);

    // Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === 'accepted';
  };

  return { promptInstall, canInstall: !!deferredPrompt, isIOS, isInstalled };
};
```

### 4. Create Install Prompt Component
```typescript
// src/shared/ui/install-prompt.tsx
export const InstallPrompt = () => {
  const { promptInstall, canInstall, isIOS, isInstalled } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <Snackbar open>
      <Alert
        severity="info"
        action={
          isIOS ? (
            <Button onClick={() => setDismissed(true)}>OK</Button>
          ) : (
            <>
              <Button onClick={promptInstall}>Cài đặt</Button>
              <IconButton onClick={() => setDismissed(true)}>
                <Close />
              </IconButton>
            </>
          )
        }
      >
        {isIOS
          ? "Thêm vào màn hình: Nhấn Share → Add to Home Screen"
          : "Cài đặt ứng dụng để truy cập nhanh hơn"
        }
      </Alert>
    </Snackbar>
  );
};
```

### 5. Create Offline Fallback Page
```typescript
// src/pages/offline.tsx
export const OfflinePage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <CloudOff sx={{ fontSize: 120, color: 'text.secondary', mb: 3 }} />
      <Typography variant="h4" gutterBottom>
        Không có kết nối mạng
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Vui lòng kiểm tra kết nối internet và thử lại
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.reload()}
      >
        Thử lại
      </Button>
    </Container>
  );
};
```

### 6. Update Vite PWA Config for Offline
```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    navigateFallback: '/offline',
    navigateFallbackDenylist: [/^\/api/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
    ],
  },
  // ... existing manifest config
})
```

### 7. Add Safe Area CSS
```css
/* Add to global styles or theme */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Adjust bottom nav */
.bottom-nav {
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

---

## Todo List

- [ ] Generate 7 iOS splash screen images (750x1334 to 2048x2732)
- [ ] Add iOS meta tags to index.html
- [ ] Add splash screen link tags to index.html
- [ ] Create use-install-prompt hook
- [ ] Create InstallPrompt component
- [ ] Create OfflinePage component
- [ ] Add offline route to router
- [ ] Update vite.config.ts with workbox offline config
- [ ] Add safe-area-inset CSS variables
- [ ] Test on iOS Safari (real device or simulator)
- [ ] Test install prompt on Android Chrome
- [ ] Test offline fallback
- [ ] Verify splash screens on different iOS devices

---

## Success Criteria

### iOS Optimization
- ✅ PWA installable on iOS Safari
- ✅ Status bar translucent with theme color
- ✅ Splash screens display on all iOS devices
- ✅ No layout shift from safe area
- ✅ Full-screen standalone mode works

### Install Experience
- ✅ Android users see native install prompt
- ✅ iOS users see helpful install instructions
- ✅ Install prompt dismissable
- ✅ No prompt after installation

### Offline Support
- ✅ Offline page displays when no network
- ✅ API calls cached appropriately
- ✅ Service worker updates automatically
- ✅ Offline page <10KB

### Testing
- ✅ Test on iPhone SE, iPhone 14, iPhone 14 Pro Max
- ✅ Test on iPad Pro 11" and 12.9"
- ✅ Test on Android Chrome (Pixel, Samsung)
- ✅ Lighthouse PWA score >90

---

## Risk Assessment

### Risks
1. **iOS Safari Bugs**: Safari has PWA limitations (no push notifications, limited storage)
2. **Splash Screen Generation**: Manual process, time-consuming
3. **iOS Install UX**: No native prompt, requires manual instructions
4. **Service Worker Caching**: Aggressive caching can cause stale data

### Mitigations
1. Document iOS limitations in README
2. Use automated splash generator (pwa-asset-generator)
3. Clear, visual iOS install instructions
4. Implement cache-first for static, network-first for API

---

## Security Considerations

- Service worker only on HTTPS (Vercel auto-provides)
- No sensitive data in service worker cache
- API tokens excluded from cache
- Offline page sanitized (no user data)

---

## Next Steps

After Phase 4 completion:
- Monitor PWA install metrics (localStorage tracking)
- A/B test install prompt timing (immediate vs delayed)
- Consider push notifications (Android only)
- Explore badging API for cart count

---

## Performance Impact

**Bundle Size**: +2-3KB (install prompt + offline page)
**Splash Screens**: ~1.5MB total (7 images)
**Service Worker**: Precache 26 entries (1.8MB)
**Lighthouse PWA**: Target 95+ (currently ~85 without iOS optimization)
