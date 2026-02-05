import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

export type OrderDetail = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][];
  profiles: { full_name: string | null; username: string | null } | null;
};

export const useOrder = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');

      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (*),
          profiles (
            full_name,
            username
          )
        `
        )
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as OrderDetail;
    },
    enabled: !!orderId,
  });
};
