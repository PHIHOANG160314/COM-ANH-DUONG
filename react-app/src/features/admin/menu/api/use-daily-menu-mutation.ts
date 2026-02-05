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
                const { error } = await supabase.from('daily_menus').upsert(
                    {
                        date: today,
                        product_id: productId,
                        is_active: true,
                    },
                    { onConflict: 'date, product_id' }
                );
                if (error) throw error;
            } else {
                // If setting to inactive (removing from menu)
                // We can either delete the row or set is_active = false
                // Deleting is cleaner for "not on menu today"
                const { error } = await supabase
                    .from('daily_menus')
                    .delete()
                    .eq('date', today)
                    .eq('product_id', productId);

                if (error) throw error;
            }
        },
        onSuccess: () => {
            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['daily-menu'] });
            Debug.log('✅ Daily menu updated successfully');
        },
        onError: (err) => {
            Debug.error('❌ Failed to update daily menu:', err);
            // You could add a toast notification here
        },
    });
};
