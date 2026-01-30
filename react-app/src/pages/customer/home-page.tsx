import { useState } from 'react';
import { Fab, Badge } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { MenuGrid } from '@/features/menu/components/menu-grid';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { useCartStore } from '@/features/cart/model/cart-store';

export const CustomerHomePage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <>
      <MenuGrid />

      <Fab
        color="primary"
        aria-label="cart"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setIsCartOpen(true)}
      >
        <Badge badgeContent={totalItems} color="error">
          <ShoppingCart />
        </Badge>
      </Fab>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
