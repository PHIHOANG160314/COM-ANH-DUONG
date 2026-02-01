import { Grid, Card, CardContent, Skeleton, Box } from '@mui/material';

interface MenuSkeletonProps {
  count?: number;
}

export const MenuSkeleton = ({ count = 6 }: MenuSkeletonProps) => {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Image skeleton */}
            <Skeleton
              variant="rectangular"
              width="100%"
              height={160}
              animation="wave"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
            />

            <CardContent sx={{ flexGrow: 1 }}>
              {/* Category chip skeleton */}
              <Skeleton
                variant="rounded"
                width={80}
                height={24}
                animation="wave"
                sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)' }}
              />

              {/* Title skeleton */}
              <Skeleton
                variant="text"
                width="90%"
                height={28}
                animation="wave"
                sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)' }}
              />

              {/* Description skeleton */}
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                animation="wave"
                sx={{ mb: 0.5, bgcolor: 'rgba(255,255,255,0.1)' }}
              />
              <Skeleton
                variant="text"
                width="80%"
                height={20}
                animation="wave"
                sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }}
              />

              {/* Price and button skeleton */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton
                  variant="text"
                  width={100}
                  height={32}
                  animation="wave"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                />
                <Skeleton
                  variant="rounded"
                  width={120}
                  height={36}
                  animation="wave"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
