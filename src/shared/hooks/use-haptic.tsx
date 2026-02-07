import { useCallback } from 'react';

type HapticIntensity = 'light' | 'medium' | 'heavy';

interface UseHapticReturn {
  trigger: (intensity?: HapticIntensity) => void;
  isSupported: boolean;
}

export const useHaptic = (): UseHapticReturn => {
  const isSupported = 'vibrate' in navigator;

  const trigger = useCallback(
    (intensity: HapticIntensity = 'medium') => {
      if (!isSupported) return;

      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      };

      try {
        navigator.vibrate(patterns[intensity]);
      } catch {
        // Silent failure - haptic feedback is optional UX enhancement
      }
    },
    [isSupported]
  );

  return { trigger, isSupported };
};
