import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
} from '@mui/material';
import { LocalShipping, VerifiedUser, AccessTime, Payments } from '@mui/icons-material';
import { AppInput, AppButton } from '@/shared/ui';
import { useCartStore } from '@/features/cart/model/cart-store';
import { formatCurrency } from '@/shared/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase-client';
import { useAuth } from '@/app/providers/auth-provider';
import { PaymentMethodSelector } from '@/features/payment/components/payment-method-selector';
import { paymentApi, type PaymentProvider } from '@/features/payment/api/payment-api';
import { useAddresses } from '@/features/profile/hooks/use-addresses';
import { useLoyalty } from '@/features/profile/hooks/use-loyalty';
import { LocationOn, Star } from '@mui/icons-material';
import { Debug } from '@/shared/utils/debug';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ tên'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  address: z.string().min(5, 'Vui lòng nhập địa chỉ giao hàng'),
  note: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const { items, totalAmount, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('cash');

  // Loyalty & Addresses
  const { addresses } = useAddresses();
  const { stats } = useLoyalty();
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      phone: '',
      address: '',
    },
  });

  // Watch address field to uncheck saved address if user types manually
  const addressValue = watch('address');
  useEffect(() => {
    if (useSavedAddress && selectedAddressId) {
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (selected && addressValue !== selected.address) {
        // User modified the address manually
        // We can keep useSavedAddress true or false, but logically it's now a custom address
        // setUseSavedAddress(false); // Optional: reset selection
      }
    }
  }, [addressValue, useSavedAddress, selectedAddressId, addresses]);

  // Handle Address Selection
  const handleAddressSelect = (addressId: string) => {
    const selected = addresses.find((a) => a.id === addressId);
    if (selected) {
      setSelectedAddressId(addressId);
      setUseSavedAddress(true);
      setValue('address', selected.address, { shouldValidate: true });
      if (selected.phone) {
        setValue('phone', selected.phone, { shouldValidate: true });
      }
    }
  };

  // Calculations
  const subtotal = totalAmount();
  const discountAmount = pointsToRedeem * 100; // 1 Point = 100 VND
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      // 1. Get Customer ID (if logged in)
      let customerId = null;
      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        if (customer) {
          customerId = customer.id;
        }
      }

      // 2. Create Order
      const orderPayload = {
        customer_id: customerId,
        customer_name: data.fullName,
        customer_phone: data.phone,
        delivery_address: data.address,
        notes: data.note,
        total: finalTotal,
        subtotal: subtotal,
        discount: discountAmount,
        points_redeemed: pointsToRedeem,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_type: 'delivery',
      };

      // We need to cast payload because types might not be fully updated globally in IDE context
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(orderPayload as any)
        .select()
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Không thể tạo đơn hàng');

      // 3. Create Order Items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: Number(item.id),
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        item_name: item.name,
        notes: item.note,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Process Payment
      if (paymentMethod === 'cash') {
        clearCart();
        navigate('/order-success', {
          state: {
            orderId: orderData.id,
            totalAmount: finalTotal,
            paymentMethod: 'cash',
          },
        });
      } else {
        // Online Payment
        const paymentResponse = await paymentApi.createPayment(
          orderData.id,
          finalTotal, // Use discounted total
          paymentMethod
        );

        if (!paymentResponse || !paymentResponse.paymentUrl) {
          throw new Error('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
        }

        clearCart();
        window.location.href = paymentResponse.paymentUrl;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      Debug.error('Checkout error:', err);
      alert(`Có lỗi xảy ra: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Giỏ hàng trống</Typography>
        <AppButton onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Quay lại thực đơn
        </AppButton>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Thông tin giao hàng
        </Typography>
        <Paper sx={{ p: 3 }}>
          {/* Saved Addresses Section */}
          {user && addresses.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <LocationOn color="primary" fontSize="small" /> Chọn từ sổ địa chỉ
              </Typography>
              <RadioGroup
                value={selectedAddressId}
                onChange={(e) => handleAddressSelect(e.target.value)}
              >
                {addresses.map((addr) => (
                  <FormControlLabel
                    key={addr.id}
                    value={addr.id}
                    control={<Radio size="small" />}
                    label={
                      <Typography variant="body2">
                        <strong>{addr.label}:</strong> {addr.address}{' '}
                        {addr.phone ? `(${addr.phone})` : ''}
                      </Typography>
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
              <Divider sx={{ my: 2 }} />
            </Box>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <AppInput
              label="Họ và tên"
              fullWidth
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              {...register('fullName')}
            />
            <AppInput
              label="Số điện thoại"
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              {...register('phone')}
            />
            <AppInput
              label="Địa chỉ nhận hàng"
              fullWidth
              multiline
              rows={2}
              error={!!errors.address}
              helperText={errors.address?.message}
              {...register('address')}
            />
            <AppInput
              label="Ghi chú cho quán/tài xế"
              fullWidth
              multiline
              rows={2}
              {...register('note')}
            />

            {/* SEA F&B SOPs - Trust Elements */}
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<Payments />}
                label="Thanh toán khi nhận hàng"
                color="success"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip
                icon={<LocalShipping />}
                label="Giao 30-45 phút"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<VerifiedUser />}
                label="Đảm bảo chất lượng"
                color="info"
                variant="outlined"
              />
            </Box>

            <Alert 
              severity="info" 
              icon={<AccessTime />}
              sx={{ mb: 2 }}
            >
              ⏰ Giờ mở cửa: <strong>06:00 - 21:00</strong> | TP. Sa Đéc, Đồng Tháp
            </Alert>

            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Đơn hàng của bạn
        </Typography>
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
          <Box sx={{ my: 2, borderTop: '1px solid #eee' }} />

          {/* Loyalty Points Redemption */}
          {user && stats && stats.points > 0 && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: '#fffde7',
                borderRadius: 1,
                border: '1px dashed #fbc02d',
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Star sx={{ color: '#fbc02d' }} fontSize="small" /> Dùng điểm tích lũy
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Bạn có <strong>{stats.points} điểm</strong>. (100đ = 1 điểm)
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  label="Nhập số điểm"
                  value={pointsToRedeem > 0 ? pointsToRedeem : ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0 && val <= stats.points) {
                      setPointsToRedeem(val);
                    }
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">điểm</InputAdornment>,
                  }}
                  sx={{ bgcolor: 'white' }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setPointsToRedeem(stats.points)}
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
          <Box sx={{ my: 1, borderTop: '1px solid #eee' }} />
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
            onClick={handleSubmit(onSubmit)}
          >
            {paymentMethod === 'cash' ? 'Đặt hàng' : 'Thanh toán & Đặt hàng'}
          </AppButton>
        </Paper>
      </Grid>
    </Grid>
  );
};
