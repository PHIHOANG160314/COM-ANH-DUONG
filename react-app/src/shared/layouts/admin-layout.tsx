import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Restaurant as ProductIcon,
  EventNote as DailyMenuIcon,
  ReceiptLong as OrderIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  BarChart as AnalyticsIcon,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/api/use-auth';
import { ReloadPrompt } from '@/features/pwa/reload-prompt';

const drawerWidth = 240;

interface MenuItemConfig {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItemConfig[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Báo cáo', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  { text: 'Sản phẩm', icon: <ProductIcon />, path: '/admin/products' },
  { text: 'Thực đơn ngày', icon: <DailyMenuIcon />, path: '/admin/menu' },
  { text: 'Đơn hàng', icon: <OrderIcon />, path: '/admin/orders' },
  { text: 'Cài đặt', icon: <SettingsIcon />, path: '/admin/settings' },
];

export const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <ReloadPrompt />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Cơm Ánh Dương - Admin
          </Typography>

          <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
            <Avatar alt={user?.email || 'Admin'} src="/static/images/avatar/2.jpg" />
          </IconButton>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography textAlign="center">Đăng xuất</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', overflowX: 'hidden' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
