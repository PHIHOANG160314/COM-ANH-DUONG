import { Box, Typography, Button, Container, Paper, Chip, Stack } from '@mui/material';
import { LocalDining, AccessTime, Verified, LocalShipping } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #4ade80 0%, #10b981 100%)',
        color: 'white',
        py: { xs: 4, md: 6 },
        mb: 4,
        borderRadius: { xs: 0, md: 2 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          {/* Restaurant Name */}
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 1 }}
          >
            🍚 Cơm Ánh Dương
          </Typography>

          {/* Tagline */}
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, mb: 3, fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            Cơm nhà ngon - Giao nhanh tận nơi 🛵
          </Typography>

          {/* Feature Chips */}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mb: 4, gap: 1 }}
          >
            <Chip
              icon={<AccessTime sx={{ color: 'white !important' }} />}
              label="Giao 30-45 phút"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              icon={<LocalShipping sx={{ color: 'white !important' }} />}
              label="Thanh toán COD"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              icon={<Verified sx={{ color: 'white !important' }} />}
              label="Đảm bảo chất lượng"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Stack>

          {/* CTA Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LocalDining />}
              onClick={() => navigate('/menu')}
              sx={{
                bgcolor: 'white',
                color: '#10b981',
                fontWeight: 'bold',
                px: 4,
                '&:hover': { bgcolor: '#f5f5f5' },
              }}
            >
              Xem Thực Đơn
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/checkout')}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Đặt Hàng Ngay
            </Button>
          </Box>
        </Box>

        {/* Info Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mt: 4,
          }}
        >
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.95)' }}>
            <Typography variant="h4">📍</Typography>
            <Typography fontWeight="bold" color="text.primary">
              Địa chỉ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sa Đéc, Đồng Tháp
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.95)' }}>
            <Typography variant="h4">⏰</Typography>
            <Typography fontWeight="bold" color="text.primary">
              Giờ mở cửa
            </Typography>
            <Typography variant="body2" color="text.secondary">
              6:00 - 21:00 hàng ngày
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.95)' }}>
            <Typography variant="h4">📞</Typography>
            <Typography fontWeight="bold" color="text.primary">
              Hotline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              0123 456 789
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
