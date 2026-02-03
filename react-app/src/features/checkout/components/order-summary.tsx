import { Box, Typography, Paper, TextField, InputAdornment, Button } from '@mui/material';
import { Star } from '@mui/icons-material';
import { AppButton } from '@/shared/ui';
import { formatCurrency } from '@/shared/lib/formatters';
import type { CartItem } from '@/features/cart/model/cart-store';
import type { PaymentProvider } from '@/features/payment/api/payment-api';

import type { User } from '@supabase/supabase-js';

interface OrderSummaryProps {
  items: CartItem[];
  user: User | null;
  loyaltyStats: { points: number } | null;
  pointsToRedeem: number;
  onPointsChange: (points: number) => void;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  loading: boolean;
  isStoreClosed: boolean;
  paymentMethod: PaymentProvider;
  onSubmit: () => void;
}

export const OrderSummary = ({
  items,
  user,
  loyaltyStats,
  pointsToRedeem,
  onPointsChange,
  subtotal,
  discountAmount,
  finalTotal,
  loading,
  isStoreClosed,
  paymentMethod,
  onSubmit,
}: OrderSummaryProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      {items.map((item) => (
        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2">
              {item.quantity}x {item.name}
            </Typography>
          </Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {formatCurrency(item.price * item.quantity)}
          </Typography>
        </Box>
      ))}
      <Box sx={{ my: 2, borderTop: '1px solid', borderColor: 'divider' }} />

      {/* Loyalty Points Redemption */}
      {user && loyaltyStats && loyaltyStats.points > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: 'warning.light',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'warning.main',
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Star sx={{ color: 'warning.main' }} fontSize="small" /> Dùng điểm tích lũy
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Bạn có <strong>{loyaltyStats.points} điểm</strong>. (100đ = 1 điểm)
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              label="Nhập số điểm"
              value={pointsToRedeem > 0 ? pointsToRedeem : ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 0 && val <= loyaltyStats.points) {
                  onPointsChange(val);
                }
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">điểm</InputAdornment>,
              }}
              sx={{ bgcolor: 'background.paper' }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => onPointsChange(loyaltyStats.points)}
            >
              Dùng tất cả
            </Button>
          </Box>
          {pointsToRedeem > 0 && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
              Đã áp dụng giảm giá: -{formatCurrency(pointsToRedeem * 100)}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1">Tạm tính</Typography>
        <Typography variant="body1">{formatCurrency(subtotal)}</Typography>
      </Box>
      {discountAmount > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1,
            color: 'success.main',
          }}
        >
          <Typography variant="body1">Giảm giá (Điểm)</Typography>
          <Typography variant="body1" fontWeight="bold">
            -{formatCurrency(discountAmount)}
          </Typography>
        </Box>
      )}
      <Box sx={{ my: 1, borderTop: '1px solid', borderColor: 'divider' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Tổng cộng</Typography>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {formatCurrency(finalTotal)}
        </Typography>
      </Box>
      <AppButton
        variant="contained"
        fullWidth
        size="large"
        loading={loading}
        onClick={onSubmit}
        disabled={isStoreClosed || loading}
        sx={{
          bgcolor: isStoreClosed
            ? 'action.disabledBackground'
            : paymentMethod === 'cash'
              ? 'success.main'
              : 'primary.main',
          '&:hover': {
            bgcolor: isStoreClosed
              ? 'action.disabledBackground'
              : paymentMethod === 'cash'
                ? 'success.dark'
                : 'primary.dark',
          },
        }}
      >
        {isStoreClosed
          ? 'Quán đã đóng cửa'
          : paymentMethod === 'cash'
            ? 'Đặt đơn - Trả tiền mặt'
            : 'Thanh toán & Đặt hàng'}
      </AppButton>
    </Paper>
  );
};
