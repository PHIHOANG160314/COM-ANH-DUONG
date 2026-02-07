import { CircularProgress, Box } from '@mui/material';
import { Suspense } from 'react';

// Loading fallback component
export const LazyLoading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
    <CircularProgress />
  </Box>
);

// Wrapper for lazy components
export const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LazyLoading />}>{children}</Suspense>
);
