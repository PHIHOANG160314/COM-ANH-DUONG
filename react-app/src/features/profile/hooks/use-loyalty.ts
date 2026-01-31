import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/auth-provider';
import { loyaltyApi, type LoyaltyStats, type LoyaltyTransaction } from '../api/loyalty-api';

export const useLoyalty = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoyaltyData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [statsData, historyData] = await Promise.all([
        loyaltyApi.getStats(user.id),
        loyaltyApi.getHistory(user.id),
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching loyalty data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  const redeemPoints = async (points: number) => {
    try {
      setLoading(true);
      await loyaltyApi.redeemPoints(points);
      // Refresh data
      await fetchLoyaltyData();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
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
