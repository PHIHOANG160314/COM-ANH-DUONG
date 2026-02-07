import { Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { usePullToRefresh } from '../hooks/use-pull-to-refresh';

interface PullToRefreshWrapperProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

/**
 * Pull-to-refresh wrapper with visual feedback
 * - Only enabled on mobile (xs breakpoint)
 * - Shows CircularProgress while pulling
 * - Opacity scales with pull distance
 * - Executes onRefresh callback when threshold met
 *
 * Usage:
 *   <PullToRefreshWrapper onRefresh={async () => await refetch()}>
 *     <MenuContent />
 *   </PullToRefreshWrapper>
 */
export const PullToRefreshWrapper = ({
  children,
  onRefresh,
  threshold = 80,
}: PullToRefreshWrapperProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.only('xs'));

  const { isRefreshing, pullDistance, handlers } = usePullToRefresh({
    onRefresh,
    threshold,
  });

  // Calculate opacity based on pull progress (0 to 1)
  const pullProgress = Math.min(pullDistance / threshold, 1);

  return (
    <Box {...(isMobile ? handlers : {})} sx={{ position: 'relative' }}>
      {/* Pull indicator - only show on mobile */}
      {isMobile && (pullDistance > 0 || isRefreshing) && (
        <Box
          sx={{
            position: 'absolute',
            top: pullDistance > 0 ? pullDistance - 40 : 10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            opacity: isRefreshing ? 1 : pullProgress,
            transition: isRefreshing ? 'opacity 0.2s ease-in-out' : 'none',
          }}
        >
          <CircularProgress
            size={32}
            sx={{
              color: 'primary.main',
            }}
          />
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          transform: isMobile && pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
