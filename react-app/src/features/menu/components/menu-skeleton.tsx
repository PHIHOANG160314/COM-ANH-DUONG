import { Grid, Box, Skeleton } from '@mui/material';
import { ProductCardSkeleton } from './product-card-skeleton';

interface MenuSkeletonProps {
  count?: number;
}

/**
 * Menu grid skeleton with category chips and product cards
 * - 6-item grid layout (2 columns on mobile)
 * - Category chips skeleton row (4 chips, 60px each)
 * - Uses ProductCardSkeleton for consistency
 * - Theme-aware colors via action.hover
 */
export const MenuSkeleton = ({ count = 6 }: MenuSkeletonProps) => {
  return (
    <Box>
      {/* Category chips skeleton row */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
          overflowX: 'auto',
          py: 1,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width={60}
            height={32}
            animation="wave"
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
        ))}
      </Box>

      {/* Product grid - 2 columns mobile, 3+ desktop */}
      <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid size={{ xs: 6, sm: 4, md: 4 }} key={index}>
            <ProductCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
