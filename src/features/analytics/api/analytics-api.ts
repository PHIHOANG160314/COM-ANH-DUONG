import { supabase } from '@/shared/api/supabase-client';

export interface RevenueData {
  period: string;
  total_revenue: number;
  order_count: number;
  avg_order_value: number;
}

export interface ProductData {
  item_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface StatusData {
  status: string;
  count: number;
}

export const analyticsApi = {
  getRevenue: async (dateFrom: Date, dateTo: Date) => {
    const { data, error } = await supabase.rpc('get_revenue_analytics_secure', {
      date_from: dateFrom.toISOString(),
      date_to: dateTo.toISOString(),
    });
    if (error) throw error;
    return data as RevenueData[];
  },

  getTopProducts: async (dateFrom: Date, dateTo: Date, limit = 10) => {
    const { data, error } = await supabase.rpc('get_top_selling_items_secure', {
      date_from: dateFrom.toISOString(),
      date_to: dateTo.toISOString(),
      limit_count: limit,
    });
    if (error) throw error;
    return data as ProductData[];
  },

  getStatusDistribution: async (dateFrom: Date, dateTo: Date) => {
    const { data, error } = await supabase.rpc('get_order_status_distribution_secure', {
      date_from: dateFrom.toISOString(),
      date_to: dateTo.toISOString(),
    });
    if (error) throw error;
    return data as StatusData[];
  },
};
