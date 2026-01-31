import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 120, color: 'text.secondary' }} />

        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 'bold' }}>
          404
        </Typography>

        <Typography variant="h5" component="h2" color="text.secondary">
          Không tìm thấy trang
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Button variant="contained" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
