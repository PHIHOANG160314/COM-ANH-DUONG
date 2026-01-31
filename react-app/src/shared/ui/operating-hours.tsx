import React, { useMemo } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';

export type StoreStatus = 'open' | 'closing' | 'closed';

interface StoreTimeConfig {
  openHour: number; // 10
  closeHour: number; // 22
  closingSoonMinutes: number; // 30
}

const DEFAULT_CONFIG: StoreTimeConfig = {
  openHour: 10,
  closeHour: 22,
  closingSoonMinutes: 30,
};

export const getStoreStatus = (
  config: StoreTimeConfig = DEFAULT_CONFIG
): {
  status: StoreStatus;
  message: string;
  details: string;
  color: 'success' | 'warning' | 'error';
} => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Convert current time to minutes from midnight for easier comparison
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const openTotalMinutes = config.openHour * 60;
  const closeTotalMinutes = config.closeHour * 60;
  const closingSoonTotalMinutes = closeTotalMinutes - config.closingSoonMinutes;

  if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closingSoonTotalMinutes) {
    return {
      status: 'open',
      message: 'Đang mở cửa',
      details: `Mở cửa từ ${config.openHour}:00 - ${config.closeHour}:00`,
      color: 'success',
    };
  } else if (
    currentTotalMinutes >= closingSoonTotalMinutes &&
    currentTotalMinutes < closeTotalMinutes
  ) {
    return {
      status: 'closing',
      message: 'Sắp đóng cửa',
      details: `Chỉ nhận đơn đến ${config.closeHour}:00`,
      color: 'warning',
    };
  } else {
    return {
      status: 'closed',
      message: 'Đã đóng cửa',
      details: `Mở cửa lại lúc ${config.openHour}:00 sáng mai`,
      color: 'error',
    };
  }
};

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
