import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/auth-provider';
import { addressApi, type CustomerAddress, type InsertAddress } from '../api/address-api';

export const useAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!user) {
        setAddresses([]);
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const data = await addressApi.getAddresses(user.id);
      setAddresses(data);
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const addAddress = async (address: Omit<InsertAddress, 'customer_id'>) => {
    if (!user) return null;
    try {
      setLoading(true);
      const newAddress = await addressApi.addAddress(user.id, address);
      await fetchAddresses(); // Refresh list
      return newAddress;
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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
