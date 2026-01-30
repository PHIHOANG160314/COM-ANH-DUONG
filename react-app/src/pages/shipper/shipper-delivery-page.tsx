import { Box, Typography, Container, Tab, Tabs } from '@mui/material';
import { useDeliveryOrders } from '@/features/delivery/api/use-delivery-orders';
import { DeliveryCard } from '@/features/delivery/components/delivery-card';
import { AppLoading } from '@/shared/ui';
import { useState, useMemo } from 'react';

export const ShipperDeliveryPage = () => {
  const { data: orders, isLoading } = useDeliveryOrders();
  const [tabValue, setTabValue] = useState(0);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (tabValue === 0) return orders.filter((o) => o.status === 'ready');
    if (tabValue === 1) return orders.filter((o) => o.status === 'delivering');
    if (tabValue === 2) return orders.filter((o) => o.status === 'completed');
    return [];
  }, [orders, tabValue]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return <AppLoading fullScreen message="Đang tải danh sách đơn giao..." />;
  }

  return (
    <Container maxWidth="sm" sx={{ pb: 10 }}>
      <Box sx={{ py: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Giao Hàng
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label={`Chờ giao (${orders?.filter((o) => o.status === 'ready').length || 0})`} />
          <Tab
            label={`Đang giao (${orders?.filter((o) => o.status === 'delivering').length || 0})`}
          />
          <Tab label={`Lịch sử (${orders?.filter((o) => o.status === 'completed').length || 0})`} />
        </Tabs>
      </Box>

      {filteredOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Không có đơn hàng nào trong danh sách này.</Typography>
        </Box>
      ) : (
        <Box>
          {filteredOrders.map((order) => (
            <DeliveryCard key={order.id} order={order} />
          ))}
        </Box>
      )}
    </Container>
  );
};
