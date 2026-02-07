import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Badge,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  HomeOutlined as HomeOutlinedIcon,
  Restaurant as MenuIcon,
  RestaurantMenuOutlined as MenuOutlinedIcon,
  ShoppingCart as CartIcon,
  ShoppingCartOutlined as CartOutlinedIcon,
  Person as PersonIcon,
  PersonOutline as PersonOutlinedIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/features/cart/model/cart-store';

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.totalItems());

  // Determine active route
  const getActiveRoute = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname.startsWith('/menu')) return 1;
    if (location.pathname.startsWith('/checkout')) return 2;
    if (location.pathname.startsWith('/profile')) return 3;
    return 0;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const routes = ['/', '/menu', '/checkout', '/profile'];
    navigate(routes[newValue]);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' }, // Mobile only
        paddingBottom: 'env(safe-area-inset-bottom)', // iOS safe area
      }}
      elevation={8}
    >
      <MuiBottomNavigation
        value={getActiveRoute()}
        onChange={handleChange}
        showLabels
        sx={{
          height: 56,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 60,
            maxWidth: 120,
            minHeight: 56, // Touch target
          },
          '& .Mui-selected': {
            color: 'primary.main',
          },
        }}
      >
        <BottomNavigationAction
          label="Trang chủ"
          icon={getActiveRoute() === 0 ? <HomeIcon /> : <HomeOutlinedIcon />}
        />
        <BottomNavigationAction
          label="Thực đơn"
          icon={getActiveRoute() === 1 ? <MenuIcon /> : <MenuOutlinedIcon />}
        />
        <BottomNavigationAction
          label="Giỏ hàng"
          icon={
            <Badge badgeContent={totalItems} color="error" max={99}>
              {getActiveRoute() === 2 ? <CartIcon /> : <CartOutlinedIcon />}
            </Badge>
          }
        />
        <BottomNavigationAction
          label="Tài khoản"
          icon={getActiveRoute() === 3 ? <PersonIcon /> : <PersonOutlinedIcon />}
        />
      </MuiBottomNavigation>
    </Paper>
  );
};
