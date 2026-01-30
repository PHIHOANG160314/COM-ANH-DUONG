import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { AppInput, AppButton } from '@/shared/ui';
import { useCartStore } from '@/features/cart/model/cart-store';
import { formatCurrency } from '@/shared/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/shared/api/supabase-client';
import { useAuth } from '@/app/providers/auth-provider';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      phone: '', // Need to fetch from profile if available
      address: '',
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null, // Allow guest checkout logic later if needed
          total_amount: totalAmount(),
          status: 'pending',
          delivery_address: data.address,
          contact_phone: data.phone,
          note: data.note,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        note: item.note,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Cleanup & Redirect
      clearCart();
      navigate('/order-success', { state: { orderId: orderData.id } });
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Tổng cộng</Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {formatCurrency(totalAmount())}
            </Typography>
          </Box>
          <AppButton
            variant="contained"
            fullWidth
            size="large"
            loading={loading}
            onClick={handleSubmit(onSubmit)}
          >
            Đặt hàng
          </AppButton>
        </Paper>
      </Grid>
    </Grid>
  );
};
