import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import { CheckCircleOutline, Phone } from '@mui/icons-material';
import { formatCurrency } from '@/shared/lib/formatters';
import { ZaloChatFab } from '@/shared/ui/zalo-chat-fab';
import { TrustBadges } from '@/shared/ui/trust-badges';
import { CONTACT_INFO } from '@/shared/config/contact';
import { useOrder } from '@/features/orders/api/use-order';
import { PrintReceipt } from '@/features/orders/components/print-receipt';

export const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount;
  const paymentMethod = location.state?.paymentMethod;

  const { data: order } = useOrder(orderId);

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
        position: 'relative', // For absolute positioning context if needed
      }}
    >
      <ZaloChatFab phoneNumber={CONTACT_INFO.zalo} />

      <CheckCircleOutline color="success" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Đặt hàng thành công!
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 400 }}>
        Cảm ơn bạn đã đặt món tại Cơm Ánh Dương. Đơn hàng của bạn{' '}
        {orderId ? `(#${orderId.slice(0, 8).toUpperCase()})` : ''} đang được xử lý.
      </Typography>

      <Paper sx={{ p: 3, mb: 3, maxWidth: 400, width: '100%' }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Thông tin đơn hàng
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {orderId && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Mã đơn hàng:</Typography>
            <Typography fontWeight="medium">#{orderId.slice(0, 8).toUpperCase()}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="text.secondary">Thời gian dự kiến:</Typography>
          <Typography fontWeight="medium" color="primary">
            30-45 phút
          </Typography>
        </Box>

        {paymentMethod === 'cash' && totalAmount && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              💵 Chuẩn bị tiền mặt
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {formatCurrency(totalAmount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Vui lòng chuẩn bị số tiền để thanh toán khi nhận hàng
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Phone />}
          href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
          sx={{ textTransform: 'none' }}
        >
          Gọi quán
        </Button>
        {order && <PrintReceipt order={order} />}
      </Box>

      <Button variant="contained" onClick={() => navigate('/')}>
        Tiếp tục đặt món
      </Button>

      <Box sx={{ mt: 6, maxWidth: 600, width: '100%' }}>
        <TrustBadges variant="checkout" />
      </Box>
    </Box>
  );
};
