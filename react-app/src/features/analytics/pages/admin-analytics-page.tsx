import {
  Box,
  Typography,
  Grid,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAnalytics } from '../hooks/use-analytics';
import { AppLoading } from '@/shared/ui/app-loading';
import { formatCurrency } from '@/shared/lib/formatters';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AdminAnalyticsPage = () => {
  const { setDateRange, revenueData, topProducts, statusDist, loading } = useAnalytics();

  const handleRangeChange = (value: string) => {
    const now = new Date();
    switch (value) {
      case 'this_week':
        setDateRange({
          from: startOfWeek(now, { weekStartsOn: 1 }),
          to: endOfWeek(now, { weekStartsOn: 1 }),
        });
        break;
      case 'this_month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'last_month': {
        const lastMonth = subMonths(now, 1);
        setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      }
      default:
        break;
    }
  };

  if (loading && revenueData.length === 0) return <AppLoading />;

  // Summary Metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.total_revenue, 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + item.order_count, 0);
  const avgOrderVal = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Báo cáo thống kê
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Thời gian</InputLabel>
          <Select
            label="Thời gian"
            defaultValue="this_month"
            onChange={(e) => handleRangeChange(e.target.value)}
          >
            <MenuItem value="this_week">Tuần này</MenuItem>
            <MenuItem value="this_month">Tháng này</MenuItem>
            <MenuItem value="last_month">Tháng trước</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Doanh thu
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {formatCurrency(totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng đơn hàng
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Giá trị trung bình/đơn
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(avgOrderVal)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ doanh thu
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  formatter={(value: number | undefined) => [
                    formatCurrency(value ?? 0),
                    'Doanh thu',
                  ]}
                />
                <Legend />
                <Bar dataKey="total_revenue" name="Doanh thu" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Trạng thái đơn hàng
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {statusDist.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top sản phẩm bán chạy
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="item_name" type="category" width={150} />
                <Tooltip
                  formatter={(value: number | undefined) => [
                    formatCurrency(value ?? 0),
                    'Doanh thu',
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
