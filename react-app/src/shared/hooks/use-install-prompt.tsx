import { useState, useEffect } from 'react';

interface UseInstallPromptReturn {
  promptInstall: () => Promise<boolean>;
  canInstall: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const useInstallPrompt = (): UseInstallPromptReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Check if already installed (standalone mode)
    const installed = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(installed);

    // Android install prompt (beforeinstallprompt event)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
