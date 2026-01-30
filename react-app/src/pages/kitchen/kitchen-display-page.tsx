import { Box, Typography, Grid, Paper } from '@mui/material';
import { useKitchenOrders, useOrdersSubscription } from '@/features/kds/api/use-kitchen-orders';
import { OrderTicket } from '@/features/kds/components/order-ticket';
import { AppLoading } from '@/shared/ui';

export const KitchenDisplayPage = () => {
  const { data: orders, isLoading } = useKitchenOrders();
  useOrdersSubscription();

  if (isLoading) {
    return <AppLoading fullScreen message="Đang tải danh sách đơn hàng..." />;
  }

  if (!orders?.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          Hiện tại không có đơn hàng nào cần xử lý.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Bếp / Bar ({orders.length})
        </Typography>
        <Paper sx={{ p: 1, px: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Real-time Active
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={order.id}>
            <OrderTicket order={order} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
