import { Typography, Box, Grid, Paper, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminStats } from '@/features/admin/reports/use-admin-stats';
import { formatCurrency } from '@/shared/lib/formatters';

export const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Doanh thu hôm nay
            </Typography>
            <Typography component="p" variant="h4" fontWeight="bold">
              {formatCurrency(stats?.revenueToday || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đơn hàng đã hoàn thành
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Đơn hàng hôm nay
            </Typography>
            <Typography component="p" variant="h4" fontWeight="bold">
              {stats?.ordersCountToday || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tất cả trạng thái
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Biểu đồ doanh thu (7 ngày qua)
      </Typography>
      <Paper sx={{ p: 3, height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats?.revenueChartData || []}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value: number | undefined) => {
                if (value === undefined) return '';
                return new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value);
              }}
            />
            <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
            <Bar dataKey="revenue" name="Doanh thu" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};
