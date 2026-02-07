import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/providers/use-auth';
import { addressApi, type CustomerAddress, type InsertAddress } from '../api/address-api';
import { Debug } from '@/shared/utils/debug';

export type { CustomerAddress, InsertAddress };

export const useAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await addressApi.getAddresses(user.id);
      setAddresses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      Debug.error('Error fetching addresses:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (address: Omit<InsertAddress, 'customer_id'>) => {
    if (!user) return null;
    try {
      setLoading(true);
      const newAddress = await addressApi.addAddress(user.id, address);
      await fetchAddresses(); // Refresh list
      return newAddress;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, updates: Partial<InsertAddress>) => {
    try {
      setLoading(true);
      const updated = await addressApi.updateAddress(id, updates);
      await fetchAddresses();
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      setLoading(true);
      await addressApi.deleteAddress(id);
      await fetchAddresses();
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
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    refresh: fetchAddresses,
  };
};
