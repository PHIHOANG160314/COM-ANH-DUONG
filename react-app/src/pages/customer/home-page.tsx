import { useState } from 'react';
import { Fab, Badge, Typography, Box } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { MenuGrid } from '@/features/menu/components/menu-grid';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { useCartStore } from '@/features/cart/model/cart-store';
import { HeroSection } from '@/features/home/components/hero-section';

export const CustomerHomePage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <>
      {/* Hero Banner */}
      <HeroSection />

      {/* Menu Section */}
      <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          🍽️ Thực đơn hôm nay
        </Typography>
        <MenuGrid />
      </Box>

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
