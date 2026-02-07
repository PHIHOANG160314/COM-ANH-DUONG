import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import dayjs from 'dayjs';

export interface DailyStats {
  today: {
    revenue: number;
    orders: number;
    avgOrderValue: number;
  };
  yesterday: {
    revenue: number;
    orders: number;
  };
  last7Days: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  topItems: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  ordersByStatus: {
    pending: number;
    completed: number;
    cancelled: number;
    other: number;
  };
}

export const useAdminStats = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-stats-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          // Invalidate query to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<DailyStats> => {
      const todayStart = dayjs().startOf('day').toISOString();
      const todayEnd = dayjs().endOf('day').toISOString();
      const yesterdayStart = dayjs().subtract(1, 'day').startOf('day').toISOString();
      const yesterdayEnd = dayjs().subtract(1, 'day').endOf('day').toISOString();
      const last7DaysStart = dayjs().subtract(6, 'day').startOf('day').toISOString();

      // Fetch all orders from last 7 days to now
      const { data: orders, error } = await supabase
        .from('orders')
        .select(
          `
          id,
          total_amount,
          status,
          created_at,
          order_items (
            product_id,
            quantity,
            unit_price,
            product:products (
              name
            )
          )
        `
        )
        .gte('created_at', last7DaysStart)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Initialize stats
      const stats: DailyStats = {
        today: { revenue: 0, orders: 0, avgOrderValue: 0 },
        yesterday: { revenue: 0, orders: 0 },
        last7Days: [],
        topItems: [],
        ordersByStatus: { pending: 0, completed: 0, cancelled: 0, other: 0 },
      };

      const topItemsMap = new Map<string, { name: string; quantity: number; revenue: number }>();

      // Process orders
      orders.forEach((order) => {
        const orderDate = dayjs(order.created_at);
        const isCompleted = order.status === 'completed';

        // Status counts (all time within window, or strictly today? usually dashboard shows current state or today's activity)
        // Let's count status for TODAY's orders for "Orders Today" breakdown,
        // OR current status of all active orders.
        // Requirement says "Order count by status". Usually this means current backlog for pending/preparing.
        // But for "completed/cancelled" it usually implies a time range.
        // Let's count statuses for orders created TODAY.
        if (orderDate.isAfter(todayStart)) {
          if (order.status === 'pending') stats.ordersByStatus.pending++;
          else if (order.status === 'completed') stats.ordersByStatus.completed++;
          else if (order.status === 'cancelled') stats.ordersByStatus.cancelled++;
          else stats.ordersByStatus.other++;
        }

        // Today's Stats
        if (orderDate.isAfter(todayStart) && orderDate.isBefore(todayEnd)) {
          if (isCompleted) {
            stats.today.revenue += order.total_amount;
          }
          // Count all orders for "today's orders" metric, or just completed?
          // Usually "Orders" count implies all incoming orders, "Revenue" implies completed.
          stats.today.orders++;
        }

        // Yesterday's Stats
        if (orderDate.isAfter(yesterdayStart) && orderDate.isBefore(yesterdayEnd)) {
          if (isCompleted) {
            stats.yesterday.revenue += order.total_amount;
          }
          stats.yesterday.orders++;
        }

        // Top Items (from completed orders in the last 7 days to get meaningful data, or just today?)
        // Let's use Today's top items as per requirement "Add top-selling items today"
        if (isCompleted && orderDate.isAfter(todayStart)) {
          if (order.order_items && Array.isArray(order.order_items)) {
            const items = order.order_items as unknown as {
              quantity: number;
              unit_price: number;
              product: { name: string } | { name: string }[] | null;
            }[];

            items.forEach((item) => {
              // Check if product exists (it might be null if joined product is deleted, though unlikely with FK)
              // Handle both object (single relation) and array (if Supabase returns array)
              const product = Array.isArray(item.product) ? item.product[0] : item.product;
              const productName = product?.name || 'Unknown Product';

              const current = topItemsMap.get(productName) || {
                name: productName,
                quantity: 0,
                revenue: 0,
              };
              current.quantity += item.quantity;
              current.revenue += item.quantity * item.unit_price;
              topItemsMap.set(productName, current);
            });
          }
        }
      });

      // Calculate AOV
      stats.today.avgOrderValue =
        stats.today.orders > 0 ? stats.today.revenue / stats.today.orders : 0; // This divides completed revenue by TOTAL orders, might be skewed.
      // Better: completed revenue / completed orders.
      const completedOrdersToday = orders.filter(
        (o) => dayjs(o.created_at).isAfter(todayStart) && o.status === 'completed'
      ).length;
      stats.today.avgOrderValue =
        completedOrdersToday > 0 ? stats.today.revenue / completedOrdersToday : 0;

      // Last 7 Days Chart Data
      const chartMap = new Map<string, { revenue: number; orders: number }>();
      // Initialize map
      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day').format('DD/MM');
        chartMap.set(date, { revenue: 0, orders: 0 });
      }

      orders.forEach((order) => {
        if (order.status === 'completed') {
          const dateStr = dayjs(order.created_at).format('DD/MM');
          if (chartMap.has(dateStr)) {
            const current = chartMap.get(dateStr)!;
            current.revenue += order.total_amount;
            current.orders += 1;
            chartMap.set(dateStr, current);
          }
        }
      });

      stats.last7Days = Array.from(chartMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }));

      // Top Items Array
      stats.topItems = Array.from(topItemsMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return stats;
    },
    refetchInterval: 30000, // Refresh every 30s
  });
};
