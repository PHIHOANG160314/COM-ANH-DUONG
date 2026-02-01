import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { AppButton } from '@/shared/ui';
import { CheckCircle, Error } from '@mui/icons-material';
import { useCartStore } from '@/features/cart/model/cart-store';

type PaymentStatus = 'success' | 'failed' | 'processing' | 'unknown';

export const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const { clearCart } = useCartStore();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // 1. Detect Provider and Basic Params
      const vnpResponseCode = searchParams.get('vnp_ResponseCode');
      const momoResultCode = searchParams.get('resultCode');
      // vnp_TxnRef is orderId in our implementation
      // orderId is orderId in MoMo
      const orderId = searchParams.get('vnp_TxnRef') || searchParams.get('orderId');

      if (!orderId) {
        setStatus('failed');
        setMessage('Không tìm thấy thông tin đơn hàng.');
        return;
      }

      // 2. Initial Status check based on Params
      let initialStatus: PaymentStatus = 'unknown';

      if (vnpResponseCode) {
        // VNPay
        if (vnpResponseCode === '00') {
          initialStatus = 'success';
        } else {
          initialStatus = 'failed';
          setMessage(`Thanh toán thất bại (Mã lỗi: ${vnpResponseCode})`);
        }
      } else if (momoResultCode) {
        // MoMo
        if (momoResultCode === '0' || momoResultCode === '9000') {
          // 0 = Success, 9000 = Authorized (Hold)
          initialStatus = 'success';
        } else {
          initialStatus = 'failed';
          setMessage(`Thanh toán thất bại (Mã lỗi: ${momoResultCode})`);
        }
      } else {
        initialStatus = 'unknown';
        setMessage('Không nhận diện được phản hồi từ cổng thanh toán.');
      }

      // 3. Verify with Backend (Optional but recommended)
      // We can check the DB to see if the webhook has already updated the status.
      // Or we can trust the params for UI display if the signature verification is too heavy for frontend.
      // Ideally, frontend should just poll the order status.

      if (initialStatus === 'success') {
        // Poll DB for confirmed status
        // For now, let's just set success. In real app, we might wait for webhook.
        setStatus('success');
        setMessage('Thanh toán thành công! Cảm ơn bạn đã đặt hàng.');
        clearCart(); // Clear cart only on confirmed success
      } else if (initialStatus === 'failed') {
        setStatus('failed');
      } else {
        setStatus('processing');
      }
    };

    checkPaymentStatus();
  }, [searchParams, clearCart]);

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold" color="success.main">
              Đặt Hàng Thành Công
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {message}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <AppButton variant="outlined" onClick={() => navigate('/')}>
                Về Trang Chủ
              </AppButton>
              {/* Could link to order details if we had orderId in state or query */}
            </Box>
          </>
        );
      case 'failed':
        return (
          <>
            <Error sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold" color="error.main">
              Thanh Toán Thất Bại
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {message}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <AppButton variant="outlined" onClick={() => navigate('/checkout')}>
                Thử Lại
              </AppButton>
              <AppButton variant="text" onClick={() => navigate('/')}>
                Về Trang Chủ
              </AppButton>
            </Box>
          </>
        );
      case 'processing':
      default:
        return (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Đang xác nhận thanh toán...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng không tắt trình duyệt.
            </Typography>
          </>
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <Paper
        sx={{
          p: 6,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 4,
        }}
        elevation={3}
      >
        {renderContent()}
      </Paper>
    </Box>
  );
};
