import { Box, Button, Stack } from '@mui/material';
import { Phone, Chat, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CONTACT_INFO } from '@/shared/config/contact';

/**
 * Floating CTA Bar - Mobile Lead Capture
 * P0 Optimization: Always-visible action buttons on mobile
 */
export const FloatingCtaBar = () => {
  const navigate = useNavigate();

  const handleZaloClick = () => {
    window.open(`https://zalo.me/${CONTACT_INFO.zalo.replace(/\s/g, '')}`, '_blank');
  };

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' }, // Mobile only
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000, // Above everything including Zalo FAB
        bgcolor: 'white',
        borderTop: '2px solid #4ade80',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
        p: 1.5,
        pb: { xs: 2, sm: 1.5 }, // Extra padding for iOS home indicator
      }}
    >
      <Stack direction="row" spacing={1} width="100%">
        {/* Gọi Ngay */}
        <Button
          component="a"
          href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
          variant="outlined"
          startIcon={<Phone />}
          fullWidth
          sx={{
            borderColor: '#ef4444',
            color: '#ef4444',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            minHeight: 44, // Touch target
            '&:hover': {
              bgcolor: '#fef2f2',
              borderColor: '#dc2626',
            },
          }}
        >
          Gọi Ngay
        </Button>

        {/* Zalo */}
        <Button
          onClick={handleZaloClick}
          variant="outlined"
          startIcon={<Chat />}
          fullWidth
          sx={{
            borderColor: '#0068ff',
            color: '#0068ff',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            minHeight: 44,
            '&:hover': {
              bgcolor: '#eff6ff',
              borderColor: '#0057d9',
            },
          }}
        >
          Zalo
        </Button>

        {/* Đặt Hàng */}
        <Button
          onClick={() => navigate('/menu')}
          variant="contained"
          startIcon={<ShoppingCart />}
          fullWidth
          sx={{
            bgcolor: '#4ade80',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            minHeight: 44,
            boxShadow: '0 4px 8px rgba(74,222,128,0.3)',
            '&:hover': {
              bgcolor: '#22c55e',
            },
          }}
        >
          Đặt Hàng
        </Button>
      </Stack>
    </Box>
  );
};
