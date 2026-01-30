import { Box, Typography, Button } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <CheckCircleOutline color="success" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Đặt hàng thành công!
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        Cảm ơn bạn đã đặt món tại Cơm Ánh Dương. Đơn hàng của bạn{' '}
        {orderId ? `(#${orderId.slice(0, 8)})` : ''} đang được xử lý.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Tiếp tục đặt món
      </Button>
    </Box>
  );
};
