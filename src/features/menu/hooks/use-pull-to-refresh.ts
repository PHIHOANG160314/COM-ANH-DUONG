import { useState, useRef, useCallback } from 'react';

interface UsePullToRefreshReturn {
  isRefreshing: boolean;
  pullDistance: number;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

/**
 * Native pull-to-refresh hook with touch gesture handling
 *
 * @param onRefresh - Async callback to execute when pull threshold is met
 * @param threshold - Pull distance in pixels to trigger refresh (default: 80px)
 * @returns isRefreshing state, pull distance, and touch event handlers
 *
 * Usage:
 *   const { isRefreshing, pullDistance, handlers } = usePullToRefresh({
 *     onRefresh: async () => { await refetch(); }
 *   });
 *   <div {...handlers}>content</div>
 */
export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
}: UsePullToRefreshOptions): UsePullToRefreshReturn => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only trigger if scrolled to top
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing || startY.current === 0) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    // Only allow pull down (positive distance) when at top
    if (distance > 0 && window.scrollY === 0) {
      // Apply resistance: diminishing returns as pull distance increases
      const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(resistedDistance);
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    // Reset state
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  }, [isRefreshing, pullDistance, threshold, onRefresh]);

  return {
    isRefreshing,
    pullDistance,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
