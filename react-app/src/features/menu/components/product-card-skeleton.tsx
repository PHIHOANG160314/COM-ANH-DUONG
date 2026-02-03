import { Card, CardContent, Skeleton } from '@mui/material';

/**
 * Skeleton placeholder matching ProductCard dimensions
 * - Image: 140px height (rectangular)
 * - Title: 60% width
 * - Price: 40% width
 * - Theme-aware colors (no hardcoded values)
 * - Wave animation for better perceived performance
 */
export const ProductCardSkeleton = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image skeleton - 140px height to match ProductCard */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={140}
        animation="wave"
        sx={{
          bgcolor: 'action.hover', // Theme-aware
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Title skeleton - 60% width */}
        <Skeleton
          variant="text"
          width="60%"
          height={24}
          animation="wave"
          sx={{
            bgcolor: 'action.hover',
            mb: 1,
          }}
        />

        {/* Description skeleton (2 lines) */}
        <Skeleton
          variant="text"
          width="100%"
          height={16}
          animation="wave"
          sx={{
            bgcolor: 'action.hover',
            mb: 0.5,
          }}
        />
        <Skeleton
          variant="text"
          width="80%"
          height={16}
          animation="wave"
          sx={{
            bgcolor: 'action.hover',
            mb: 1.5,
          }}
        />

        {/* Price skeleton - 40% width */}
        <Skeleton
          variant="text"
          width="40%"
          height={28}
          animation="wave"
          sx={{
            bgcolor: 'action.hover',
            mb: 2,
          }}
        />

        {/* Add to cart button skeleton */}
        <Skeleton
          variant="rectangular"
          width="100%"
          height={48}
          animation="wave"
          sx={{
            bgcolor: 'action.hover',
            borderRadius: 1,
          }}
        />
      </CardContent>
    </Card>
  );
};
