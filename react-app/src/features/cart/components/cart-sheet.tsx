import { SwipeableDrawer, Box, Typography, IconButton, Divider, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../model/cart-store';
import { formatCurrency } from '@/shared/lib/formatters';

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const CartSheet = ({ open, onClose, onOpen }: CartSheetProps) => {
  const navigate = useNavigate();
  const { items, totalAmount, removeItem, updateQuantity } = useCartStore();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={false}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      PaperProps={{
        sx: {
          maxHeight: '85vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
      }}
    >
      {/* Swipe indicator */}
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: 'divider',
          borderRadius: 2,
          mx: 'auto',
          my: 1.5,
        }}
      />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Giỏ hàng ({items.length})
        </Typography>
        <IconButton
          onClick={onClose}
          size="large"
          sx={{ minWidth: 44, minHeight: 44 }} // Touch target
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Cart items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 2 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Giỏ hàng trống
            </Typography>
          </Box>
        ) : (
          items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                gap: 2,
                mb: 2,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Image */}
              <Box
                component="img"
                src={item.image_url || '/images/menu/default.png'}
                alt={item.name}
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />

              {/* Info */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(item.price)}
                </Typography>

                {/* Quantity controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.id, item.quantity - 1);
                      } else {
                        removeItem(item.id);
                      }
                    }}
                    sx={{ minWidth: 32, minHeight: 32 }}
                  >
                    -
                  </IconButton>
                  <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    sx={{ minWidth: 32, minHeight: 32 }}
                  >
                    +
                  </IconButton>
                </Box>
              </Box>

              {/* Price */}
              <Typography variant="subtitle2" fontWeight="bold">
                {formatCurrency(item.price * item.quantity)}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Footer */}
      {items.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Tổng cộng
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {formatCurrency(totalAmount())}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              sx={{
                minHeight: 48, // Touch target
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              Thanh toán
            </Button>
          </Box>
        </>
      )}
    </SwipeableDrawer>
  );
};
