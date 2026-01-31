import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { AppButton } from '@/shared/ui';
import {
  useUpdateOrderStatus,
  type KitchenOrder,
  type OrderStatus,
} from '../api/use-kitchen-orders';
import { formatRelativeTime } from '@/shared/lib/formatters';
import { useState } from 'react';
import { Debug } from '@/shared/utils/debug';

interface OrderTicketProps {
  order: KitchenOrder;
}

const statusColors: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'primary',
  ready: 'success',
  delivering: 'secondary',
  completed: 'default',
  cancelled: 'error',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang nấu',
  ready: 'Đã xong',
  delivering: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const OrderTicket = ({ order }: OrderTicketProps) => {
  const updateStatus = useUpdateOrderStatus();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setLoading(true);
    try {
      await updateStatus(order.id, newStatus);
    } catch (error) {
      Debug.error('Failed to update status', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: 4,
        borderColor: `${statusColors[order.status]}.main`,
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold">
              #{order.id.slice(0, 6).toUpperCase()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {formatRelativeTime(order.created_at)}
            </Typography>
          </Box>
          <Chip
            label={statusLabels[order.status]}
            color={statusColors[order.status]}
            size="small"
          />
        </Box>

        <Divider sx={{ mb: 1 }} />

        <List dense disablePadding>
          {order.order_items.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Box component="span" fontWeight="medium">
                    {item.quantity}x {item.products?.name || 'Unknown Item'}
                  </Box>
                }
                secondary={
                  item.note && (
                    <Box component="span" color="error.main" fontStyle="italic">
                      Note: {item.note}
                    </Box>
                  )
                }
              />
            </ListItem>
          ))}
        </List>

        {order.note && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold">
              Ghi chú đơn hàng:
            </Typography>
            <Typography variant="body2">{order.note}</Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        {order.status === 'pending' && (
          <AppButton
            fullWidth
            variant="contained"
            color="primary"
            loading={loading}
            onClick={() => handleStatusChange('preparing')}
          >
            Nhận đơn & Nấu
          </AppButton>
        )}
        {order.status === 'confirmed' && (
          <AppButton
            fullWidth
            variant="contained"
            color="primary"
            loading={loading}
            onClick={() => handleStatusChange('preparing')}
          >
            Bắt đầu nấu
          </AppButton>
        )}
        {order.status === 'preparing' && (
          <AppButton
            fullWidth
            variant="contained"
            color="success"
            loading={loading}
            onClick={() => handleStatusChange('ready')}
          >
            Báo Đã Xong
          </AppButton>
        )}
      </CardActions>
    </Card>
  );
};
