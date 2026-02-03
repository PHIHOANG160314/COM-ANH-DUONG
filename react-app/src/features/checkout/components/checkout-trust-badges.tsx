import { Box, Typography, useTheme } from '@mui/material';
import { Verified, LocalShipping, Security } from '@mui/icons-material';

interface CheckoutTrustBadgesProps {
  variant?: 'full' | 'compact';
}

/**
 * Trust badges specifically for checkout page footer
 * - VSATTP (Food Safety) certification
 * - BCT (Business Registration) verification
 * - Delivery guarantee (30 minutes or free)
 * - All badges use theme tokens for dark mode support
 */
export const CheckoutTrustBadges = ({ variant = 'full' }: CheckoutTrustBadgesProps) => {
  const theme = useTheme();

  const badges = [
    {
      icon: <Security sx={{ fontSize: variant === 'compact' ? 20 : 24 }} />,
      title: 'VSATTP',
      description: 'Chứng nhận vệ sinh an toàn thực phẩm',
    },
    {
      icon: <Verified sx={{ fontSize: variant === 'compact' ? 20 : 24 }} />,
      title: 'Đã đăng ký BCT',
      description: 'Giấy phép kinh doanh hợp lệ',
    },
    {
      icon: <LocalShipping sx={{ fontSize: variant === 'compact' ? 20 : 24 }} />,
      title: 'Giao 30 phút',
      description: 'Hoặc miễn phí',
    },
  ];

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
          py: 2,
          flexWrap: 'wrap',
        }}
      >
        {badges.map((badge, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              color: 'text.secondary',
            }}
          >
            <Box sx={{ color: 'primary.main' }}>{badge.icon}</Box>
            <Typography variant="caption" fontWeight="medium">
              {badge.title}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
        py: 3,
        px: 2,
        borderRadius: 1,
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(74, 222, 128, 0.05)'
          : 'rgba(74, 222, 128, 0.08)',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {badges.map((badge, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.87)'
                : 'white',
            }}
          >
            {badge.icon}
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {badge.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {badge.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
