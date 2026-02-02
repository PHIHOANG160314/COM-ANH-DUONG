import { Box, Typography, Grid } from '@mui/material';
import { AppButton } from '@/shared/ui';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '@/features/checkout/hooks/use-checkout';
import { AddressSection } from '@/features/checkout/components/address-section';
import { OrderSummary } from '@/features/checkout/components/order-summary';
import { useStoreStatus } from '@/shared/hooks/use-store-status';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    form: {
      register,
      formState: { errors },
    },
    items,
    user,
    loading,
    paymentMethod,
    setPaymentMethod,
    addresses,
    selectedAddressId,
    handleAddressSelect,
    stats,
    pointsToRedeem,
    setPointsToRedeem,
    subtotal,
    discountAmount,
    finalTotal,
    onSubmit,
  } = useCheckout();

  const { status } = useStoreStatus();
  const isStoreClosed = status === 'closed';

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
    <Grid container spacing={4} sx={{ pb: { xs: 12, md: 4 } }}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Typography
          variant="h5"
          gutterBottom
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
        >
          Thông tin giao hàng
        </Typography>
        <AddressSection
          user={user}
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onAddressSelect={handleAddressSelect}
          register={register}
          errors={errors}
          isStoreClosed={isStoreClosed}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Typography
          variant="h5"
          gutterBottom
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
        >
          Đơn hàng của bạn
        </Typography>
        <OrderSummary
          items={items}
          user={user}
          loyaltyStats={stats}
          pointsToRedeem={pointsToRedeem}
          onPointsChange={setPointsToRedeem}
          subtotal={subtotal}
          discountAmount={discountAmount}
          finalTotal={finalTotal}
          loading={loading}
          isStoreClosed={isStoreClosed}
          paymentMethod={paymentMethod}
          onSubmit={onSubmit}
        />
      </Grid>
    </Grid>
  );
};
