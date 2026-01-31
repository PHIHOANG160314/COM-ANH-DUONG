import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Restaurant as MenuIcon,
} from '@mui/icons-material';
import type { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ReloadPrompt } from '@/features/pwa/reload-prompt';
import { InstallPrompt } from '@/features/pwa/install-prompt';
import { useAuth } from '@/features/auth/api/use-auth';
import { useCartStore } from '@/features/cart/model/cart-store';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const totalItems = useCartStore((state) => state.totalItems());

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <ReloadPrompt />
      <InstallPrompt />
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Cơm Ánh Dương
          </Typography>

          <IconButton color="inherit" onClick={() => navigate('/menu')}>
            <MenuIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => navigate('/checkout')}>
            <Badge badgeContent={totalItems} color="error">
              <CartIcon />
            </Badge>
          </IconButton>

          {user ? (
            <IconButton color="inherit" onClick={() => navigate('/profile')}>
              <PersonIcon />
            </IconButton>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 4 }}>
        {children || <Outlet />}
      </Container>

      <Box
        component="footer"
        sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#f5f5f5', textAlign: 'center' }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Cơm Ánh Dương. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};
