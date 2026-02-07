import { Box, Container, Typography, Card, CardContent, Avatar, Rating } from '@mui/material';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Chị Lan Anh',
    avatar: '👩',
    role: 'Nhân viên văn phòng',
    rating: 5,
    comment: 'Đặt cơm trưa hàng ngày, ngon và giao đúng giờ. Rất hài lòng!',
  },
  {
    name: 'Anh Minh',
    avatar: '👨',
    role: 'Giáo viên',
    rating: 5,
    comment: 'Cơm ngon, giá hợp lý. Phần ăn nhiều, ship nhanh. Sẽ ủng hộ dài dài!',
  },
  {
    name: 'Chị Thu',
    avatar: '👩‍💼',
    role: 'Kế toán',
    rating: 5,
    comment: 'Món ăn đa dạng, mỗi ngày đều có món mới. Vị miền Tây đậm đà!',
  },
];

export const CustomerTestimonials = () => {
  return (
    <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Khách hàng nói gì về chúng tôi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hàng nghìn đánh giá 5 sao từ khách hàng
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2, fontSize: 28 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    "{testimonial.comment}"
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
