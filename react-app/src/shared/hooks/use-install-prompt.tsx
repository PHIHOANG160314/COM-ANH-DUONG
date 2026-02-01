import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UseInstallPromptReturn {
  promptInstall: () => Promise<boolean>;
  canInstall: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const useInstallPrompt = (): UseInstallPromptReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Compute iOS and installed status without setState in useEffect
  const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    // Android install prompt (beforeinstallprompt event)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    // Clear deferred prompt
    setDeferredPrompt(null);

    return outcome === 'accepted';
  };

  return {
    promptInstall,
    canInstall: !!deferredPrompt,
    isIOS,
    isInstalled,
  };
};
