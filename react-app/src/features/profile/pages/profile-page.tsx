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
} from '@mui/material';
import { History, Person, LocationOn, Star } from '@mui/icons-material';
import { useAuth } from '@/app/providers/auth-provider';
import { useLoyalty } from '../hooks/use-loyalty';
import { LoyaltyCard } from '../components/loyalty-card';
import { AppLoading } from '@/shared/ui/app-loading';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { stats, history, loading } = useLoyalty();

  if (loading) return <AppLoading />;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Xin chào, {user?.user_metadata?.full_name || 'Bạn'}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
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
                <ListItemButton selected>
                  <ListItemIcon>
                    <Star color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Thành viên & Điểm" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText primary="Lịch sử đơn hàng" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText primary="Sổ địa chỉ" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="Thông tin cá nhân" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Content Area */}
        <Grid size={{ xs: 12, md: 8 }}>
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
        </Grid>
      </Grid>
    </Container>
  );
};
