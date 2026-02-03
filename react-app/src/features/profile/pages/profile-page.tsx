import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  History,
  Person,
  LocationOn,
  Star,
  DarkMode,
  LightMode,
  Favorite,
} from '@mui/icons-material';
import { useAuth } from '@/app/providers/use-auth';
import { useLoyalty } from '../hooks/use-loyalty';
import { LoyaltyCard } from '../components/loyalty-card';
import { AddressList } from '../components/address-list';
import { AppLoading } from '@/shared/ui/app-loading';
import { useTheme } from '@/shared/theme/use-theme';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type TabType = 'loyalty' | 'addresses' | 'history' | 'personal' | 'favorites';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { stats, history, loading } = useLoyalty();
  const { mode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('loyalty');

  if (loading) return <AppLoading />;

  const renderContent = () => {
    switch (activeTab) {
      case 'addresses':
        return (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <AddressList />
          </Paper>
        );
      case 'favorites':
        return (
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <Favorite sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">Tính năng đang phát triển</Typography>
          </Paper>
        );
      case 'loyalty':
      default:
        return (
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <History /> Lịch sử tích điểm
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {history.length > 0 ? (
              <List>
                {history.map((txn) => (
                  <ListItem key={txn.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={txn.description}
                      secondary={format(new Date(txn.created_at), 'dd/MM/yyyy HH:mm', {
                        locale: vi,
                      })}
                    />
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={txn.points > 0 ? 'success.main' : 'error.main'}
                    >
                      {txn.points > 0 ? '+' : ''}
                      {txn.points} điểm
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography>Chưa có giao dịch nào</Typography>
              </Box>
            )}
          </Paper>
        );
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Xin chào, {user?.user_metadata?.full_name || 'Bạn'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý tài khoản và điểm tích lũy của bạn
        </Typography>
      </Box>

      {/* Loyalty Card Section */}
      <Box sx={{ mb: 4 }}>
        {stats ? (
          <LoyaltyCard stats={stats} />
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Chưa có thông tin thành viên. Đặt đơn đầu tiên để tham gia!</Typography>
          </Paper>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar Menu */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <List component="nav">
              <ListItem disablePadding>
                <ListItemButton selected={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')}>
                  <ListItemIcon>
                    <Star color={activeTab === 'loyalty' ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary="Thành viên & Điểm" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton selected={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')}>
                  <ListItemIcon>
                    <LocationOn color={activeTab === 'addresses' ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary="Sổ địa chỉ" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton selected={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')}>
                  <ListItemIcon>
                    <Favorite color={activeTab === 'favorites' ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary="Món yêu thích" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton selected={activeTab === 'personal'} onClick={() => setActiveTab('personal')}>
                  <ListItemIcon>
                    <Person color={activeTab === 'personal' ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary="Thông tin cá nhân" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>{mode === 'dark' ? <DarkMode /> : <LightMode />}</ListItemIcon>
                <FormControlLabel
                  control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
                  label={mode === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}
                  sx={{ flexGrow: 1, ml: 0 }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Content Area */}
        <Grid size={{ xs: 12, md: 8 }}>{renderContent()}</Grid>
      </Grid>
    </Container>
  );
};
