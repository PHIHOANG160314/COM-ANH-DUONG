// Extend Window and Navigator interfaces for non-standard properties
interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

interface ExtendedWindow extends Window {
  opera?: unknown;
  MSStream?: unknown;
  navigator: ExtendedNavigator;
}

export const isIOS = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const win = window as unknown as ExtendedWindow;
  const nav = navigator as ExtendedNavigator;

  const userAgent = nav.userAgent || nav.vendor || (win.opera ? String(win.opera) : '');

  // Detect iOS
  if (/iPad|iPhone|iPod/.test(userAgent) && !win.MSStream) {
    return true;
  }

  // Detect iPad with macOS user agent (iPadOS 13+)
  if (nav.maxTouchPoints && nav.maxTouchPoints > 2 && /MacIntel/.test(nav.platform)) {
    return true;
  }

  return false;
};

export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;

  const nav = window.navigator as ExtendedNavigator;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;

  return isStandalone;
};
