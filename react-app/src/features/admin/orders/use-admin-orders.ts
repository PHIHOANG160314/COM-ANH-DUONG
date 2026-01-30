import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

export type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    products: Database['public']['Tables']['products']['Row'] | null;
  })[];
  profiles: { full_name: string | null; username: string | null } | null;
};

export const useAdminOrders = () => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            products (*)
          ),
          profiles (
            full_name,
            username
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(100); // Limit to last 100 orders for performance

      if (error) throw error;
      return data as Order[];
    },
    refetchInterval: 15000, // Poll every 15s
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order['status'] }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  return {
    orders: ordersQuery.data,
    isLoading: ordersQuery.isLoading,
    updateOrderStatus,
  };
};
