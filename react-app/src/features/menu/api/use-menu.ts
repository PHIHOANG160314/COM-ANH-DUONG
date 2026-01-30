import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export const useDailyMenu = () => {
  return useQuery({
    queryKey: ['daily-menu'],
    queryFn: async () => {
      // For now, we fetch all active products.
      // In a real daily menu scenario, we might have a separate table or a date filter.
      // But assuming 'is_active' and 'is_sold_out' are managed daily.

      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          categories (
            id,
            name,
            sort_order
          )
        `
        )
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as (Product & { categories: Category | null })[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as Category[];
    },
  });
};
