import { useState, useEffect } from 'react';
import { analyticsApi, type RevenueData, type ProductData, type StatusData } from '../api/analytics-api';
import { startOfMonth, endOfMonth } from 'date-fns';

export const useAnalytics = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [statusDist, setStatusDist] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rev, prod, stat] = await Promise.all([
        analyticsApi.getRevenue(dateRange.from, dateRange.to),
        analyticsApi.getTopProducts(dateRange.from, dateRange.to),
        analyticsApi.getStatusDistribution(dateRange.from, dateRange.to),
      ]);
      setRevenueData(rev || []);
      setTopProducts(prod || []);
      setStatusDist(stat || []);
    } catch (err: any) {
      console.error('Analytics Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  return {
    dateRange,
    setDateRange,
    revenueData,
    topProducts,
    statusDist,
    loading,
    error,
    refresh: fetchData,
  };
};
