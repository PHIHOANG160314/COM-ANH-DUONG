import { Box, Typography, Button, Paper, Chip, Stack } from '@mui/material';
import { LocalDining, AccessTime, LocalFlorist } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CONTACT_INFO } from '@/shared/config/contact';

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
        px: 3,
        mb: 4,
        mx: -3, // Negative margin to break out of Container's 24px padding
        borderRadius: { xs: 0, md: 2 },
        overflow: 'hidden',
      }}
    >
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          textAlign: 'center',
          maxWidth: 'lg',
          mx: 'auto',
          px: 3,
        }}
      >
        {/* Restaurant Name */}
        <Box component={motion.div} variants={itemVariants}>
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 1 }}
          >
            🍚 Cơm Ánh Dương - Tân Phú Đông
          </Typography>
        </Box>

        {/* Tagline */}
        <Box component={motion.div} variants={itemVariants}>
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, mb: 3, fontSize: { xs: '1rem', md: '1.25rem' } }}
          >
            Cơm ngon, giá tốt - Giao nhanh tận nơi 🛵
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
                icon={<LocalFlorist sx={{ color: 'white !important' }} />}
                label="Đối diện Viva Coffee"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Chip
                icon={<LocalDining sx={{ color: 'white !important' }} />}
                label="Chuẩn vị miền Tây"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Chip
                icon={<AccessTime sx={{ color: 'white !important' }} />}
                label="Giao nhanh Tân Phú Đông"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </motion.div>
          </Stack>
        </Box>

        {/* CTA Buttons */}
        <Box component={motion.div} variants={itemVariants}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              width: '100%',
              maxWidth: { xs: '280px', sm: 'none' },
              mx: 'auto',
            }}
          >
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
                  minHeight: 48, // A11y: touch target
                  width: { xs: '100%', sm: 'auto' },
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
                  minHeight: 48, // A11y: touch target
                  width: { xs: '100%', sm: 'auto' },
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
          maxWidth: 'lg',
          mx: 'auto',
          px: 3,
        }}
      >
        <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'white' }}>
            <Typography variant="h4">📍</Typography>
            <Typography fontWeight="bold" sx={{ color: '#1a1a2e' }}>
              Địa chỉ
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {CONTACT_INFO.address.short}
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
              {CONTACT_INFO.hours}
            </Typography>
          </Paper>
        </motion.div>
        <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
          <Paper
            component="a"
            href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: 'white',
              textDecoration: 'none',
              display: 'block',
              cursor: 'pointer',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 1,
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                opacity: 0.1,
                animation: 'pulse 2s ease-in-out infinite',
              },
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.1, transform: 'scale(1)' },
                '50%': { opacity: 0.2, transform: 'scale(1.05)' },
              },
              '&:hover::before': {
                opacity: 0.25,
              },
            }}
          >
            <Typography variant="h4" sx={{ animation: 'phoneBounce 1s ease-in-out infinite' }}>
              📞
            </Typography>
            <Typography fontWeight="bold" sx={{ color: '#ef4444', fontSize: '1.1rem' }}>
              Hotline
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#1a1a1a',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {CONTACT_INFO.phone}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold', mt: 0.5 }}>
              ☎️ Nhấn để gọi ngay
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};
