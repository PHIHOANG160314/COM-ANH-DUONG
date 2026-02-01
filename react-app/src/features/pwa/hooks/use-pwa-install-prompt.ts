import { useState, useEffect, useCallback } from 'react';
import { useScrollThreshold } from '@/shared/hooks/use-scroll-threshold';
import { Debug } from '@/shared/utils/debug';
import { isIOS, isStandalone } from '@/shared/utils/platform';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_KEY_DISMISSED = 'pwa_prompt_dismissed_at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const usePwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [timeThresholdMet, setTimeThresholdMet] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  const scrollThresholdMet = useScrollThreshold(50);
  const isIosDevice = isIOS();
  const isAppStandalone = isStandalone();

  // Check persistence on mount - use callback to avoid setState in effect
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissedAt = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedAt) {
      const dismissedDate = new Date(parseInt(dismissedAt, 10));
      const now = new Date();
      return now.getTime() - dismissedDate.getTime() < DISMISS_DURATION_MS;
    }
    return false;
  });

  // Time threshold: 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeThresholdMet(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // Event listener (Android/Desktop)
  useEffect(() => {
    if (isIosDevice) return; // Don't listen on iOS

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      Debug.log('PWA: beforeinstallprompt captured');
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isIosDevice]);

  const promptInstall = useCallback(async () => {
    if (isIosDevice) {
      setShowIosPrompt(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      Debug.log('PWA: User accepted install');
    } else {
      Debug.log('PWA: User dismissed install');
    }

    setDeferredPrompt(null);
  }, [deferredPrompt, isIosDevice]);

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    setShowIosPrompt(false);
    localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
  }, []);

  const closeIosPrompt = useCallback(() => {
    setShowIosPrompt(false);
  }, []);

  // Logic to show prompt (Banner or Snackbar)
  // 1. Not dismissed recently
  // 2. Time threshold met
  // 3. Scroll threshold met
  // 4. (Android) Event captured OR (iOS) Device is iOS and not standalone
  const triggersMet = !isDismissed && timeThresholdMet && scrollThresholdMet;
  const showPrompt = triggersMet && (!!deferredPrompt || (isIosDevice && !isAppStandalone));

  return {
    showPrompt,
    showIosPrompt,
    promptInstall,
    dismissPrompt,
    closeIosPrompt,
    isIosDevice,
  };
};
