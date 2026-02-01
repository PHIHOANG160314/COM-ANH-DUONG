import React from 'react';
import { Fab, Box, Typography, Tooltip } from '@mui/material';

interface ZaloChatFabProps {
  phoneNumber?: string; // e.g., '0987654321'
  oaId?: string; // e.g., '1234567890'
  label?: string;
}

/**
 * Zalo Chat Floating Action Button
 * SEA F&B SOPs Standard - Direct Messaging Channel
 */
export const ZaloChatFab: React.FC<ZaloChatFabProps> = ({
  phoneNumber = '0987654321',
  label = 'Chat hỗ trợ',
}) => {
  // Prefer deep link to phone if no OA ID provided
  const zaloUrl = `https://zalo.me/${phoneNumber}`;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 24, sm: 100 }, // Lower on mobile to avoid blocking content
        left: { xs: 16, sm: 'auto' }, // Move to LEFT on mobile
        right: { xs: 'auto', sm: 24 }, // Keep right on desktop
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Tooltip title="Liên hệ Zalo" placement="left">
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: '#0068ff',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid #0068ff',
              },
            }}
          >
            {label}
          </Typography>

          <Fab
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: 'white',
              '&:hover': { bgcolor: '#f5f5f5' },
              width: 60,
              height: 60,
              boxShadow: '0 4px 12px rgba(0,104,255,0.3)',
            }}
            aria-label="Chat Zalo"
          >
            <Box
              component="img"
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
              alt="Zalo"
              sx={{ width: 40, height: 40 }}
              onError={(e) => {
                // Fallback if the wikimedia link fails or is blocked
                (e.target as HTMLImageElement).src =
                  'https://cdn-icons-png.flaticon.com/512/3670/3670051.png';
              }}
            />
          </Fab>

          {/* Status Dot */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: 12,
              height: 12,
              bgcolor: '#4caf50',
              border: '2px solid white',
              borderRadius: '50%',
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
};
