import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/auth-provider';
import { loyaltyApi, type LoyaltyStats, type LoyaltyTransaction } from '../api/loyalty-api';

export const useLoyalty = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoyaltyData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [statsData, historyData] = await Promise.all([
        loyaltyApi.getStats(user.id),
        loyaltyApi.getHistory(user.id),
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (err: any) {
      console.error('Error fetching loyalty data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, [user]);

  const redeemPoints = async (points: number) => {
    try {
      setLoading(true);
      await loyaltyApi.redeemPoints(points);
      // Refresh data
      await fetchLoyaltyData();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    history,
    loading,
    error,
    redeemPoints,
    refresh: fetchLoyaltyData,
  };
};
