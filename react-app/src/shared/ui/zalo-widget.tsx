import React from 'react';
import { Fab, Box, Typography } from '@mui/material';

/**
 * Zalo Floating Chat Widget
 * SEA F&B SOPs Standard - Zero-Friction Customer Support
 * Per Binh Pháp Ch.2 (Hành Quân) - Communication Bridge
 */
export const ZaloWidget: React.FC = () => {
  const zaloOAUrl = 'https://zalo.me/0987654321'; // Replace with actual Zalo OA ID

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: '10px',
          fontWeight: 'bold',
        }}
      >
        Chat ngay!
      </Typography>
      <Fab
        href={zaloOAUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: '#0068ff',
          '&:hover': { bgcolor: '#0055cc' },
          width: 56,
          height: 56,
          minHeight: 44, // SEA F&B Standard: 44px touch target
        }}
        aria-label="Chat Zalo"
      >
        <Box
          component="img"
          src="https://page.widget.zalo.me/static/images/Logo.svg"
          alt="Zalo"
          sx={{ width: 32, height: 32 }}
        />
      </Fab>
    </Box>
  );
};
