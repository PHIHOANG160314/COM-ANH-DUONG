import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useAdminOrders } from '@/features/admin/orders/use-admin-orders';
import { OrderTable } from '@/features/admin/orders/order-table';

import type { Order } from '@/features/admin/orders/use-admin-orders';

export const AdminOrdersPage = () => {
  const { orders, isLoading, updateOrderStatus } = useAdminOrders();

  const handleStatusChange = (id: string, status: Order['status']) => {
    if (window.confirm('Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này?')) {
      updateOrderStatus.mutate({ id, status });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý đơn hàng
      </Typography>

      {!orders || orders.length === 0 ? (
        <Alert severity="info">Chưa có đơn hàng nào.</Alert>
      ) : (
        <OrderTable orders={orders} onStatusChange={handleStatusChange} />
      )}
    </Box>
  );
};
