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
import { OperatingHours } from '@/shared/ui/operating-hours';
import { ZaloChatFab } from '@/shared/ui/zalo-chat-fab';
import { FooterCompliance } from '@/shared/ui/footer-compliance';
import { BottomNavigation } from '@/shared/ui/bottom-navigation';
import { CONTACT_INFO } from '@/shared/config/contact';

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
              size="large" // A11y: 48px target
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIconHamburger />
            </IconButton>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexGrow: 1,
              cursor: 'pointer',
              py: 1,
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="img"
              src="/brand-logo-header.png"
              alt="Cơm Ánh Dương Logo"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
              }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Cơm Ánh Dương
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ mr: 2 }}>
              <OperatingHours />
            </Box>
          )}

          {!isMobile && (
            <>
              <Button
                color="inherit"
                size="large" // A11y
                onClick={() => navigate('/menu')}
                sx={{ minHeight: 44 }} // A11y: 44px min height
              >
                Thực đơn
              </Button>
            </>
          )}

          <IconButton
            color="inherit"
            size="large" // A11y: 48px target
            onClick={() => navigate('/checkout')}
          >
            <Badge badgeContent={totalItems} color="error">
              <CartIcon />
            </Badge>
          </IconButton>

          {user ? (
            <IconButton
              color="inherit"
              size="large" // A11y: 48px target
              onClick={() => navigate('/profile')}
            >
              <PersonIcon />
            </IconButton>
          ) : (
            <Button
              color="inherit"
              size="large" // A11y
              onClick={() => navigate('/login')}
              sx={{ minHeight: 44 }} // A11y: 44px min height
            >
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>

      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: 4,
          pb: { xs: '72px', md: 4 }, // Extra bottom padding for mobile bottom nav (56px + 16px)
        }}
      >
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
        <Container maxWidth="lg">
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
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    py: 1.5, // Touch target > 44px
                    display: 'block',
                  }}
                  onClick={() => navigate('/menu')}
                >
                  Thực đơn
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    py: 1.5,
                    display: 'block',
                  }}
                  onClick={() => navigate('/checkout')}
                >
                  Giỏ hàng
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    py: 1.5,
                    display: 'block',
                  }}
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
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    py: 1.5,
                    display: 'block',
                  }}
                  onClick={() => navigate('/admin')}
                >
                  Quản trị
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    py: 1.5,
                    display: 'block',
                  }}
                  onClick={() => navigate('/kitchen')}
                >
                  Bếp
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    py: 1.5,
                    display: 'block',
                  }}
                  onClick={() => navigate('/pos')}
                >
                  POS
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                    py: 1.5,
                    display: 'block',
                  }}
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
                <Typography variant="body2" sx={{ py: 0.5 }}>
                  📞 {CONTACT_INFO.phone}
                </Typography>
                <Typography variant="body2" sx={{ py: 0.5 }}>
                  📍 {CONTACT_INFO.address.full}
                </Typography>
                <Typography variant="body2" sx={{ py: 0.5 }}>
                  ☕ {CONTACT_INFO.landmark}
                </Typography>
                <Typography variant="body2" sx={{ py: 0.5 }}>
                  🕐 {CONTACT_INFO.hours}
                </Typography>
              </Box>
            </Box>
          </Box>

          <FooterCompliance />

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2, mt: 3 }} />

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
            © {new Date().getFullYear()} Cơm Ánh Dương. All rights reserved.
          </Typography>
        </Container>
      </Box>
      <ZaloChatFab phoneNumber={CONTACT_INFO.zalo} />
      <BottomNavigation />
    </Box>
  );
};
