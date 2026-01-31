import { Box, Typography, Button, Container, Paper, Chip, Stack } from '@mui/material';
import { LocalDining, AccessTime, Verified, LocalShipping } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #4ade80 0%, #10b981 100%)',
        color: 'white',
        py: { xs: 4, md: 6 },
        mb: 4,
        borderRadius: { xs: 0, md: 2 },
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ textAlign: 'center' }}
        >
          {/* Restaurant Name */}
          <Box component={motion.div} variants={itemVariants}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 1 }}
            >
              🍚 Cơm Ánh Dương
            </Typography>
          </Box>

          {/* Tagline */}
          <Box component={motion.div} variants={itemVariants}>
            <Typography
              variant="h5"
              sx={{ opacity: 0.9, mb: 3, fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              Cơm nhà ngon - Giao nhanh tận nơi 🛵
            </Typography>
          </Box>

          {/* Feature Chips */}
          <Box component={motion.div} variants={itemVariants}>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ mb: 4, gap: 1 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Chip
                  icon={<AccessTime sx={{ color: 'white !important' }} />}
                  label="Giao 30-45 phút"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Chip
                  icon={<LocalShipping sx={{ color: 'white !important' }} />}
                  label="Thanh toán COD"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Chip
                  icon={<Verified sx={{ color: 'white !important' }} />}
                  label="Đảm bảo chất lượng"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </motion.div>
            </Stack>
          </Box>

          {/* CTA Buttons */}
          <Box component={motion.div} variants={itemVariants}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.95 }}
              >
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
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
              </motion.div>
            </Box>
          </Box>
        </Box>

        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mt: 4,
          }}
        >
          <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
              <Typography variant="h4">📍</Typography>
              <Typography fontWeight="bold" sx={{ color: '#1a1a2e' }}>
                Địa chỉ
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Phường Sa Đéc, Tỉnh Đồng Tháp
              </Typography>
            </Paper>
          </motion.div>
          <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
              <Typography variant="h4">⏰</Typography>
              <Typography fontWeight="bold" sx={{ color: '#1a1a2e' }}>
                Giờ mở cửa
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                6:00 - 21:00 hàng ngày
              </Typography>
            </Paper>
          </motion.div>
          <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
              <Typography variant="h4">📞</Typography>
              <Typography fontWeight="bold" sx={{ color: '#1a1a2e' }}>
                Hotline
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                0123 456 789
              </Typography>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};
