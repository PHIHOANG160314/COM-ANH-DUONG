import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Divider,
  Link,
  IconButton,
} from '@mui/material';
import { Phone, Map, CheckCircle, DirectionsBike, Cancel } from '@mui/icons-material';
import { AppButton } from '@/shared/ui';
import { formatCurrency, formatRelativeTime } from '@/shared/lib/formatters';
import type { DeliveryOrder } from '../api/use-delivery-orders';
import { useUpdateDeliveryStatus } from '../api/use-delivery-orders';
import { useState } from 'react';

interface DeliveryCardProps {
  order: DeliveryOrder;
}

export const DeliveryCard = ({ order }: DeliveryCardProps) => {
  const updateStatus = useUpdateDeliveryStatus();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: 'delivering' | 'completed' | 'cancelled') => {
    if (status === 'cancelled' && !confirm('Bạn có chắc chắn muốn hủy đơn này?')) return;

    setLoading(true);
    try {
      await updateStatus(order.id, status);
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái.');
    } finally {
      setLoading(false);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address || '')}`;

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: order.status === 'delivering' ? 'secondary.main' : 'success.main',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            #{order.id.slice(0, 6).toUpperCase()}
          </Typography>
          <Chip
            label={order.status === 'ready' ? 'Sẵn sàng' : 'Đang giao'}
            color={order.status === 'ready' ? 'success' : 'secondary'}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {formatRelativeTime(order.updated_at)}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Khách hàng:
          </Typography>
          {order.contact_phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Phone fontSize="small" color="action" />
              <Link href={`tel:${order.contact_phone}`} underline="hover" color="inherit">
                {order.contact_phone}
              </Link>
            </Box>
          )}
          {order.delivery_address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Map fontSize="small" color="action" />
              <Link
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="inherit"
              >
                {order.delivery_address}
              </Link>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2">Thu hộ (COD):</Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatCurrency(order.total_amount)}
          </Typography>
        </Box>

        {order.note && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mt: 1, bgcolor: '#fff4f4', p: 1, borderRadius: 1 }}
          >
            Note: {order.note}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        {order.status === 'ready' ? (
          <AppButton
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<DirectionsBike />}
            loading={loading}
            onClick={() => handleStatusChange('delivering')}
          >
            Bắt đầu giao
          </AppButton>
        ) : (
          <>
            <IconButton
              color="error"
              disabled={loading}
              onClick={() => handleStatusChange('cancelled')}
              sx={{ border: '1px solid', borderColor: 'error.main', mr: 1 }}
            >
              <Cancel />
            </IconButton>
            <AppButton
              variant="contained"
              color="success"
              fullWidth
              size="large"
              startIcon={<CheckCircle />}
              loading={loading}
              onClick={() => handleStatusChange('completed')}
            >
              Hoàn thành
            </AppButton>
          </>
        )}
      </CardActions>
    </Card>
  );
};
