import React, { useMemo } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';
import { getStoreStatus } from '@/shared/utils/store-hours';

interface OperatingHoursProps {
  showDetails?: boolean;
}

/**
 * Operating Hours Badge with Traffic Light System
 * SEA F&B SOPs Standard - Clear Status Indication
 */
export const OperatingHours: React.FC<OperatingHoursProps> = ({ showDetails = false }) => {
  const { status, message, details, color } = useMemo(() => getStoreStatus(), []);

  return (
    <Tooltip title={details} arrow>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: status === 'closed' ? '#f5f5f5' : `${color}.light`,
          color: status === 'closed' ? 'text.secondary' : `${color}.dark`,
          px: 1.5,
          py: 0.5,
          borderRadius: 4,
          border: '1px solid',
          borderColor: status === 'closed' ? 'divider' : `${color}.main`,
          cursor: 'help',
        }}
      >
        <FiberManualRecord
          sx={{
            fontSize: 12,
            color: status === 'closed' ? 'text.disabled' : `${color}.main`,
            animation: status === 'open' ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        />
        <Typography variant="caption" fontWeight="bold">
          {message}
        </Typography>
        {showDetails && (
          <>
            <Typography variant="caption" sx={{ mx: 0.5, opacity: 0.5 }}>
              |
            </Typography>
            <Typography variant="caption">
              {status === 'closed' ? 'Mở 10:00 - 22:00' : '10:00 - 22:00'}
            </Typography>
          </>
        )}
      </Box>
    </Tooltip>
  );
};
