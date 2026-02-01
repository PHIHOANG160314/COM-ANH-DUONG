import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

interface PageTransitionProps {
  children: ReactNode;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <Box
      sx={{
        animation: `${fadeIn} 0.2s ease-in-out`,
      }}
    >
      {children}
    </Box>
  );
};
