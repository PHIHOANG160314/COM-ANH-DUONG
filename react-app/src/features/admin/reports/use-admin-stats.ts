import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import dayjs from 'dayjs';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = dayjs().format('YYYY-MM-DD');

      // 1. Revenue Today (completed orders)
      // Note: In a real app, use a database function for this.
      // For FSD Lite, we'll query today's completed orders.
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (ordersError) throw ordersError;

      const revenueToday = todayOrders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + o.total_amount, 0);

      const ordersCountToday = todayOrders.length;

      // 2. Revenue last 7 days for chart
      const last7Days = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
      const { data: weekOrders, error: weekError } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', `${last7Days}T00:00:00`)
        .eq('status', 'completed');

      if (weekError) throw weekError;

      // Group by date
      const chartDataMap = new Map<string, number>();
      // Initialize last 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day').format('DD/MM');
        chartDataMap.set(date, 0);
      }

      weekOrders.forEach((order) => {
        const date = dayjs(order.created_at).format('DD/MM');
        const current = chartDataMap.get(date) || 0;
        chartDataMap.set(date, current + order.total_amount);
      });

      const revenueChartData = Array.from(chartDataMap.entries()).map(([date, revenue]) => ({
        date,
        revenue,
      }));

      // 3. Top Selling (Simple proxy: count appearances in order_items of completed orders)
      // Ideally this needs a join or RPC.
      // Let's assume we want top 5 products.
      // This is expensive on client side if many orders.
      // Optimized approach: RPC.
      // Fallback approach for MVP: Don't implement top selling perfectly on client without RPC.
      // Let's skip Top Selling details for now or implement a simple placeholder.

      return {
        revenueToday,
        ordersCountToday,
        revenueChartData,
      };
    },
  });
};
