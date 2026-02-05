import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

export type DeliveryOrder = Database['public']['Tables']['orders']['Row'] & {
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    menu_items: Database['public']['Tables']['menu_items']['Row'] | null;
  })[];
};

export const useDeliveryOrders = () => {
  return useQuery({
    queryKey: ['delivery-orders'],
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
        .in('status', ['ready', 'delivering', 'completed'])
        .order('updated_at', { ascending: false })
        .limit(50); // Show newest updates first

      if (error) throw error;

      // Filter for orders that have an address (implying delivery)
      // Ideally, we should have an 'order_type' column, but checking address is a decent proxy for now
      return (data as DeliveryOrder[]).filter(
        (order) => !!order.delivery_address && order.delivery_address !== 'Mang về'
      );
    },
    refetchInterval: 10000, // Poll every 10s for new delivery orders
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return async (orderId: string, status: 'delivering' | 'completed' | 'cancelled') => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
  };
};
