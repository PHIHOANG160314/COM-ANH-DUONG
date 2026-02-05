import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';
import { Debug } from '@/shared/utils/debug';

export type OrderStatus = Database['public']['Tables']['orders']['Row']['status'];

export type KitchenOrder = Database['public']['Tables']['orders']['Row'] & {
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    menu_items: Database['public']['Tables']['menu_items']['Row'] | null;
  })[];
};

export const useKitchenOrders = () => {
  return useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            menu_items (*)
          )
        `
        )
        .in('status', ['pending', 'confirmed', 'preparing'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as KitchenOrder[];
    },
  });
};

export const useOrdersSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          Debug.log('Realtime update:', payload);
          // Simple invalidation for now. Optimistic updates can be added later.
          queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

    if (error) throw error;

    // Invalidate to refresh UI
    queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
  };
};
