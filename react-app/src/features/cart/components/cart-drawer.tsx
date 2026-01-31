import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Divider,
  Button,
  Stack,
  Avatar,
} from '@mui/material';
import { Close, Remove, Add, DeleteOutline } from '@mui/icons-material';
import { useCartStore } from '../model/cart-store';
import { formatCurrency } from '@/shared/lib/formatters';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, totalAmount } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #eee',
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Giỏ hàng ({items.reduce((acc, item) => acc + item.quantity, 0)})
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {items.length === 0 ? (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              sx={{ textAlign: 'center', py: 4 }}
            >
              <Typography sx={{ color: '#666' }}>Giỏ hàng trống</Typography>
              <Button onClick={onClose} sx={{ mt: 2 }}>
                Xem thực đơn
              </Button>
            </Box>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <Box
                  key={item.id}
                  component={motion.div}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  sx={{ mb: 2 }}
                >
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeItem(item.id)}
                        component={motion.button}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <DeleteOutline color="error" fontSize="small" />
                      </IconButton>
                    }
                    sx={{ px: 0 }}
                  >
                    <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                      <Avatar
                        src={item.image_url || '/placeholder-food.png'}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {formatCurrency(item.price)}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                          <IconButton
                            component={motion.button}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            size="small"
                            sx={{ border: '1px solid #ddd', p: 0.5 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography
                            component={motion.span}
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            variant="body2"
                            sx={{ minWidth: 20, textAlign: 'center' }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            component={motion.button}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            size="small"
                            sx={{ border: '1px solid #ddd', p: 0.5 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider component="li" />
                </Box>
              ))}
            </AnimatePresence>
          )}
        </List>

        {items.length > 0 && (
          <Box
            component={motion.div}
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            sx={{ p: 2, borderTop: '1px solid #eee', bgcolor: 'background.default' }}
          >
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1">Tổng tiền:</Typography>
              <Typography
                component={motion.span}
                key={totalAmount()}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                variant="h6"
                color="primary"
                fontWeight="bold"
              >
                {formatCurrency(totalAmount())}
              </Typography>
            </Stack>
            <Button
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
            >
              Thanh toán
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
