import { Box, Container, Typography, Paper } from '@mui/material';
import { AccessTime, LocalShipping } from '@mui/icons-material';
import { motion } from 'framer-motion';

export const UrgencyBanner = () => {
  return (
    <Box sx={{ py: 4, bgcolor: 'warning.light' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <AccessTime sx={{ fontSize: 32 }} />
              <LocalShipping sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              ⚡ Đặt trước 10:00 - Giao trước 11:30
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95 }}>
              Cơm nóng, ngon, đúng giờ - Miễn phí ship nội thành Sa Đéc
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};
