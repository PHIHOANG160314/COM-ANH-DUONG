import { Box, Card, CardContent, CardMedia, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';

const specialties = [
  {
    title: 'Hủ Tiếu Sa Đéc',
    description: 'Sợi hủ tiếu dai ngon đặc trưng, nước dùng ngọt thanh từ xương hầm.',
    image: '/images/specialties/hu-tieu-sa-dec.png',
    delay: 0,
  },
  {
    title: 'Cá Lóc Nướng Lá Sen',
    description: 'Cá lóc đồng nướng trui thơm lừng, cuốn cùng lá sen non tươi mát.',
    image: '/images/specialties/ca-loc-nuong-la-sen.png',
    delay: 0.1,
  },
  {
    title: 'Bánh Phồng Tôm Sa Giang',
    description: 'Đặc sản trứ danh, giòn rụm, đậm đà hương vị tôm đất miền Tây.',
    image: '/images/specialties/banh-phong-tom-sa-giang.png',
    delay: 0.2,
  },
];

export const RegionalSpecialties = () => {
  return (
    <Box sx={{ py: 6, bgcolor: 'action.hover' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
            Đặc Sản Miền Tây
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Khám phá hương vị ẩm thực độc đáo miền Đồng Tháp
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {specialties.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: item.delay }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-8px)' },
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}
              >
                <CardMedia component="img" height="200" image={item.image} alt={item.title} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
