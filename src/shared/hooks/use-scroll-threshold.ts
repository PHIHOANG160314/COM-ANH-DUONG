import { useState, useEffect } from 'react';

/**
 * Hook that returns true after a specified percentage of the page is scrolled.
 * @param thresholdPercentage Percentage (0-100) to trigger true.
 */
export const useScrollThreshold = (thresholdPercentage: number = 50): boolean => {
  const [thresholdMet, setThresholdMet] = useState(false);

  useEffect(() => {
    // If content is short (no scroll), we might want to consider it "scrolled"
    // For now, let's strictly follow the scroll requirement or check if body fits viewport.
    const checkScroll = () => {
      if (thresholdMet) return;

      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;

      // If page is not scrollable, consider threshold met immediately?
      // Requirement says "User has scrolled >= 50%".
      // If docHeight is 0 (content fits screen), scrollTop is 0. 0/0 is NaN.
      if (docHeight <= 0) {
        setThresholdMet(true);
        return;
      }

      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent >= thresholdPercentage) {
        setThresholdMet(true);
      }
    };

    // Check immediately in case we load at bottom or non-scrollable
    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, [thresholdPercentage, thresholdMet]);

  return thresholdMet;
};
