import { Typography, Box, Paper, CircularProgress, Chip, Stack, Grid } from '@mui/material';
import { useAdminStats } from '@/features/admin/reports/use-admin-stats';
import { formatCurrency } from '@/shared/lib/formatters';
import { DailyRevenueChart } from '@/features/admin/reports/components/daily-revenue-chart';
import { TopItemsTable } from '@/features/admin/reports/components/top-items-table';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
}) => (
  <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 140 }}>
    <Typography component="h2" variant="h6" color={`${color}.main`} gutterBottom>
      {title}
    </Typography>
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography component="p" variant="h4" fontWeight="bold">
        {value}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      {trend && (
        <Chip
          icon={trend.isPositive ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          label={`${Math.abs(trend.value).toFixed(1)}%`}
          color={trend.isPositive ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      )}
    </Box>
  </Paper>
);

export const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueTrend = calculateTrend(stats.today.revenue, stats.yesterday.revenue);
  const ordersTrend = calculateTrend(stats.today.orders, stats.yesterday.orders);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tổng quan hoạt động kinh doanh hôm nay
        </Typography>
      </Box>

      {/* Key Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Doanh thu hôm nay"
            value={formatCurrency(stats.today.revenue)}
            subtitle="vs hôm qua"
            trend={{ value: revenueTrend, isPositive: revenueTrend >= 0 }}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Đơn hàng hôm nay"
            value={stats.today.orders}
            subtitle="vs hôm qua"
            trend={{ value: ordersTrend, isPositive: ordersTrend >= 0 }}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Đang xử lý"
            value={stats.ordersByStatus.pending}
            subtitle="Cần xác nhận ngay"
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Giá trị TB/Đơn"
            value={formatCurrency(stats.today.avgOrderValue)}
            subtitle="Hôm nay"
            color="success"
          />
        </Grid>
      </Grid>

      {/* Main Content Row */}
      <Grid container spacing={3}>
        {/* Chart Section */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <DailyRevenueChart data={stats.last7Days} />
        </Grid>

        {/* Top Items Section */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <TopItemsTable items={stats.topItems} />
        </Grid>
      </Grid>

      {/* Status Breakdown Row */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Trạng thái đơn hàng (Hôm nay)
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-around">
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.ordersByStatus.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chờ xử lý
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.ordersByStatus.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hoàn thành
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {stats.ordersByStatus.cancelled}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã hủy
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h4" color="text.primary" fontWeight="bold">
                {stats.ordersByStatus.other}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Khác (Giao hàng/Bếp)
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};
