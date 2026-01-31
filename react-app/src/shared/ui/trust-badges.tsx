import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { VerifiedUser, Spa, LocalAtm, Lock, LocalShipping } from '@mui/icons-material';

interface TrustBadgeItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color?: string;
}

const TrustBadgeItem: React.FC<TrustBadgeItemProps> = ({
  icon,
  title,
  subtitle,
  color = '#2e7d32',
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
    <Box sx={{ color: color, display: 'flex' }}>{icon}</Box>
    <Box>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

interface TrustBadgesProps {
  variant?: 'checkout' | 'footer' | 'minimal';
}

/**
 * Trust Badges Component
 * SEA F&B SOPs Standard - Building Credibility
 */
export const TrustBadges: React.FC<TrustBadgesProps> = ({ variant = 'minimal' }) => {
  if (variant === 'minimal') {
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', opacity: 0.8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <VerifiedUser fontSize="small" color="success" />
          <Typography variant="caption">ATTP Đạt chuẩn</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Spa fontSize="small" color="success" />
          <Typography variant="caption">Nguyên liệu tươi</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Lock fontSize="small" color="action" />
          <Typography variant="caption">Bảo mật SSL</Typography>
        </Box>
      </Box>
    );
  }

  // Checkout or Footer Full Version
  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TrustBadgeItem
            icon={<VerifiedUser fontSize="medium" />}
            title="VSATTP"
            subtitle="Chứng nhận đạt chuẩn"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TrustBadgeItem
            icon={<Spa fontSize="medium" />}
            title="Tươi ngon"
            subtitle="100% Nguyên liệu sạch"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TrustBadgeItem
            icon={<LocalShipping fontSize="medium" />}
            title="Giao nhanh"
            subtitle="Dưới 45 phút"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TrustBadgeItem
            icon={<LocalAtm fontSize="medium" />}
            title="Hoàn tiền"
            subtitle="Nếu món lỗi/hỏng"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
