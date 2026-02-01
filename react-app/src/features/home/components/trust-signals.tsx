import { Box, Container, Typography, Paper } from '@mui/material';
import { Verified, LocalShipping, ThumbUp, LocalDining } from '@mui/icons-material';
import { motion } from 'framer-motion';

const trustItems = [
  {
    icon: Verified,
    title: 'ATTP đảm bảo',
    description: 'Giấy phép vệ sinh ATTP đầy đủ',
    color: 'success.main',
  },
  {
    icon: LocalShipping,
    title: 'Giao nhanh 30 phút',
    description: 'Miễn phí ship nội thành',
    color: 'primary.main',
  },
  {
    icon: ThumbUp,
    title: '5000+ đơn hàng',
    description: 'Khách hàng hài lòng',
    color: 'warning.main',
  },
  {
    icon: LocalDining,
    title: 'Nguyên liệu tươi',
    description: 'Chọn lọc kỹ mỗi ngày',
    color: 'secondary.main',
  },
];

export const TrustSignals = () => {
  return (
    <Box sx={{ py: 6, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
            Tại sao chọn Cơm Ánh Dương?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cam kết chất lượng - An toàn - Nhanh chóng
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'transform 0.2s',
                    bgcolor: 'background.paper',
                    '&:hover': { transform: 'translateY(-8px)' },
                  }}
                >
                  <Icon sx={{ fontSize: 48, color: item.color, mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                    {item.description}
                  </Typography>
                </Paper>
              </motion.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};
