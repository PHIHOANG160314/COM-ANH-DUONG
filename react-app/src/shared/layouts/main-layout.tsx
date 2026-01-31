import { useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Restaurant as MenuIcon,
  Menu as MenuIconHamburger,
  Home as HomeIcon,
  Login as LoginIcon,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: 'Trang chủ', path: '/', icon: <HomeIcon /> },
    { label: 'Thực đơn', path: '/menu', icon: <MenuIcon /> },
    { label: 'Giỏ hàng', path: '/checkout', icon: <CartIcon />, badge: totalItems },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem>
          <Typography variant="h6" sx={{ fontWeight: 'bold', px: 2, py: 1 }}>
            Cơm Ánh Dương
          </Typography>
        </ListItem>
        <Divider />
        {navItems.map((item) => (
          <ListItemButton key={item.path} onClick={() => handleNavigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        <Divider />
        {user ? (
          <ListItemButton onClick={() => handleNavigate('/profile')}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Tài khoản" />
          </ListItemButton>
        ) : (
          <ListItemButton onClick={() => handleNavigate('/login')}>
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Đăng nhập" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

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
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIconHamburger />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Cơm Ánh Dương
          </Typography>

          {!isMobile && (
            <>
              <Button color="inherit" onClick={() => navigate('/menu')}>
                Thực đơn
              </Button>
            </>
          )}

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

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>

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
