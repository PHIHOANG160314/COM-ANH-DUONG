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
        sx={{
          py: 4,
          px: 3,
          mt: 'auto',
          backgroundColor: '#1a1a2e',
          color: '#fff',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 3,
            }}
          >
            {/* Customer Section */}
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Khách hàng
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/menu')}
                >
                  Thực đơn
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/checkout')}
                >
                  Giỏ hàng
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/profile')}
                >
                  Tài khoản
                </Typography>
              </Box>
            </Box>

            {/* Business Section */}
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quản lý
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/admin')}
                >
                  Quản trị
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/kitchen')}
                >
                  Bếp
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/pos')}
                >
                  POS
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/delivery')}
                >
                  Giao hàng
                </Typography>
              </Box>
            </Box>

            {/* Contact Section */}
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Liên hệ
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">📞 0123 456 789</Typography>
                <Typography variant="body2">📍 Hà Nội, Việt Nam</Typography>
                <Typography variant="body2">🕐 8:00 - 22:00 hàng ngày</Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
            © {new Date().getFullYear()} Cơm Ánh Dương. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
