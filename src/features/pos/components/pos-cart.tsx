import { Box, Paper, Typography, Button, List, ListItem, IconButton } from '@mui/material';
import { Remove, Add, DeleteOutline } from '@mui/icons-material';
import { useCartStore } from '@/features/cart/model/cart-store';
import { formatCurrency } from '@/shared/lib/formatters';
import { AppButton } from '@/shared/ui';

interface PosCartProps {
  tableId: string | null;
  onClearTable: () => void;
  onSubmitOrder: () => void;
  loading?: boolean;
}

export const PosCart = ({ tableId, onClearTable, onSubmitOrder, loading }: PosCartProps) => {
  const { items, updateQuantity, removeItem, totalAmount } = useCartStore();

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {tableId === 'takeaway' ? 'Khách Mang Về' : `Bàn ${tableId}`}
        </Typography>
        <Button size="small" color="inherit" onClick={onClearTable}>
          Đổi bàn
        </Button>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">Chưa có món nào</Typography>
          </Box>
        ) : (
          items.map((item) => (
            <Box key={item.id} sx={{ mb: 1 }}>
              <ListItem
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {item.name}
                  </Typography>
                  <Typography variant="subtitle2" color="primary">
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      sx={{ border: '1px solid', borderColor: 'divider', p: 0.5 }}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      sx={{ border: '1px solid', borderColor: 'divider', p: 0.5 }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                  <IconButton size="small" color="error" onClick={() => removeItem(item.id)}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            </Box>
          ))
        )}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1">Tổng tiền:</Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatCurrency(totalAmount())}
          </Typography>
        </Box>
        <AppButton
          variant="contained"
          fullWidth
          size="large"
          disabled={items.length === 0}
          loading={loading}
          onClick={onSubmitOrder}
        >
          Lên đơn & In
        </AppButton>
      </Box>
    </Paper>
  );
};
