import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import { useAuth } from '@/app/providers/use-auth';
import type { Database } from '@/shared/types/database.types';

type SavedItem = Database['public']['Tables']['saved_items']['Row'];

/**
 * Hook to fetch user's favorite menu items
 */
export const useFavorites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedItem[];
    },
    enabled: !!user,
  });
};

/**
 * Hook to toggle favorite status of a menu item
 */
export const useToggleFavorite = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check if already favorited
      const { data: existing } = await supabase
        .from('saved_items')
        .select('id')
        .eq('customer_id', user.id)
        .eq('menu_item_id', parseInt(menuItemId))
        .maybeSingle();

      if (existing) {
        // Remove from favorites
        const { error } = await supabase.from('saved_items').delete().eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        // Add to favorites
        const { error } = await supabase.from('saved_items').insert({
          customer_id: user.id,
          menu_item_id: parseInt(menuItemId),
        });
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

/**
 * Hook to check if a menu item is favorited
 */
export const useIsFavorite = (menuItemId: string) => {
  const { data: favorites } = useFavorites();
  return favorites?.some((fav) => fav.menu_item_id === parseInt(menuItemId)) ?? false;
};
