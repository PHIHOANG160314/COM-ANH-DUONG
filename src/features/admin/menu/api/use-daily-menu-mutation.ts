import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import dayjs from 'dayjs';
import { Debug } from '@/shared/utils/debug';

export const useUpdateDailyMenu = () => {
    const queryClient = useQueryClient();
    const today = dayjs().format('YYYY-MM-DD');

    return useMutation({
        mutationFn: async ({ productId, isActive }: { productId: number; isActive: boolean }) => {
            // If setting to active (adding to menu)
            if (isActive) {
                // Use insert instead of upsert to avoid constraint issues
                // First try to delete any existing entry, then insert
                await supabase
                    .from('daily_menus')
                    .delete()
                    .eq('date', today)
                    .eq('product_id', productId);

                const { error } = await supabase.from('daily_menus').insert({
                    date: today,
                    product_id: productId,
                    is_active: true,
                }).select();

                if (error) {
                    throw error;
                }
            } else {
                // If setting to inactive (removing from menu)
                const { error } = await supabase
                    .from('daily_menus')
                    .delete()
                    .eq('date', today)
                    .eq('product_id', productId);

                if (error) {
                    throw error;
                }
            }
        },
        onSuccess: () => {
            // Invalidate queries to refresh UI - must match query key exactly
            queryClient.invalidateQueries({ queryKey: ['daily-menu', today] });
            Debug.log('✅ Daily menu updated successfully');
        },
        onError: (err) => {
            Debug.error('❌ Failed to update daily menu:', err);
            // You could add a toast notification here
        },
        onSettled: () => {
            // Always refetch after mutation settles (success or error)
            queryClient.invalidateQueries({ queryKey: ['daily-menu', today] });
        },
    });
};
