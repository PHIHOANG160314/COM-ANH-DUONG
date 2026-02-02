import { useState, useEffect } from 'react';
import { getStoreStatus, STORE_CONFIG } from '@/shared/utils/store-hours';

export const useStoreStatus = () => {
  const [status, setStatus] = useState(() => getStoreStatus());

  useEffect(() => {
    // Update every minute to keep status fresh
    const interval = setInterval(() => {
      setStatus(getStoreStatus());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    config: STORE_CONFIG,
  };
};
