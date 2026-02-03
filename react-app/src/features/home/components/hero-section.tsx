import { Box, Typography, Button, Paper, Chip, Stack } from '@mui/material';
import { LocalDining, AccessTime, LocalFlorist } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CONTACT_INFO } from '@/shared/config/contact';
import { QuickOrderForm } from './quick-order-form';
import { ExpressOrderForm } from './express-order-form';

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
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
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

        {/* Mini Trust Badges Row */}
        <Box component={motion.div} variants={itemVariants}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ mb: 3, gap: 1 }}
          >
            <Chip
              label="✅ 5000+ đơn hàng"
              sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                color: 'success.main',
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            />
            <Chip
              label="⭐ 4.9/5 đánh giá"
              sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                color: 'warning.main',
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            />
            <Chip
              label="🚀 Giao 30 phút"
              sx={{
                bgcolor: 'rgba(255,255,255,0.95)',
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            />
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
              maxWidth: { xs: '320px', sm: 'none' },
              mx: 'auto',
            }}
          >
            {/* Prominent ĐẶT HÀNG NGAY Button with Pulse */}
            <motion.div
              whileHover={{ scale: 1.08, boxShadow: '0 12px 28px rgba(0,0,0,0.25)' }}
              whileTap={{ scale: 0.95 }}
              style={{ width: '100%', maxWidth: '280px' }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<LocalDining />}
                onClick={() => navigate('/menu')}
                sx={{
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  px: 5,
                  py: 1.5,
                  minHeight: 56,
                  width: '100%',
                  boxShadow: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { bgcolor: 'warning.dark' },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                    animation: 'pulse 2s ease-in-out infinite',
                  },
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                    '50%': { opacity: 1, transform: 'scale(1.1)' },
                  },
                }}
              >
                🔥 ĐẶT HÀNG NGAY
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/menu')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  minHeight: 48,
                  width: { xs: '280px', sm: 'auto' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Xem Thực Đơn
              </Button>
            </motion.div>
          </Box>
        </Box>

        {/* Express Order Form */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            ⚡ Đặt nhanh - Giao trong 30 phút
          </Typography>
          <ExpressOrderForm />
        </Box>

        {/* Quick Order Form */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{ mt: 4, maxWidth: 'lg', mx: 'auto', px: 3 }}
        >
          <QuickOrderForm />
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
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper', color: 'text.primary' }}>
            <Typography variant="h4">📍</Typography>
            <Typography fontWeight="bold" sx={{ color: (theme) => theme.palette.text.primary }}>
              Địa chỉ
            </Typography>
            <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
              {CONTACT_INFO.address.short}
            </Typography>
          </Paper>
        </motion.div>
        <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper', color: 'text.primary' }}>
            <Typography variant="h4">⏰</Typography>
            <Typography fontWeight="bold" sx={{ color: (theme) => theme.palette.text.primary }}>
              Giờ mở cửa
            </Typography>
            <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
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
              bgcolor: 'background.paper',
              color: 'text.primary',
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
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`,
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
            <Typography fontWeight="bold" sx={{ color: (theme) => theme.palette.error.main, fontSize: '1.1rem' }}>
              Hotline
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: (theme) => theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {CONTACT_INFO.phone}
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};
