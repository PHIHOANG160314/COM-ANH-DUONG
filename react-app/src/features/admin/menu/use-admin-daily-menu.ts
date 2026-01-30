import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import dayjs from 'dayjs';
import type { Database } from '@/shared/types/database.types';

export type DailyMenu = Database['public']['Tables']['daily_menus']['Row'];
export type DailyMenuInsert = Database['public']['Tables']['daily_menus']['Insert'];

export const useAdminDailyMenu = (date: string) => {
  const queryClient = useQueryClient();
  const formattedDate = dayjs(date).format('YYYY-MM-DD');

  // Fetch all products to display in the list
  const productsQuery = useQuery({
    queryKey: ['admin-products-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category_id, is_active, categories(name)')
        .eq('is_active', true) // Only show active products for selection
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch daily menu items for the selected date
  const dailyMenuQuery = useQuery({
    queryKey: ['admin-daily-menu', formattedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_menus')
        .select('*')
        .eq('date', formattedDate);

      if (error) throw error;
      return data;
    },
  });

  // Toggle a product in the daily menu
  const toggleProduct = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      // Check if entry exists
      const existingEntry = dailyMenuQuery.data?.find((item) => item.product_id === productId);

      if (existingEntry) {
        // Update existing
        const { error } = await supabase
          .from('daily_menus')
          .update({ is_active: isActive })
          .eq('id', existingEntry.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from('daily_menus').insert({
          date: formattedDate,
          product_id: productId,
          is_active: isActive,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-menu', formattedDate] });
    },
  });

  // Bulk copy menu from another date
  const copyMenu = useMutation({
    mutationFn: async (sourceDate: string) => {
      const sourceFormattedDate = dayjs(sourceDate).format('YYYY-MM-DD');

      // 1. Get source menu
      const { data: sourceMenu, error: fetchError } = await supabase
        .from('daily_menus')
        .select('product_id, is_active')
        .eq('date', sourceFormattedDate)
        .eq('is_active', true);

      if (fetchError) throw fetchError;
      if (!sourceMenu || sourceMenu.length === 0) return;

      // 2. Upsert into current date
      const newMenuItems = sourceMenu.map((item) => ({
        date: formattedDate,
        product_id: item.product_id,
        is_active: true,
      }));

      // We need to handle potential duplicates carefully, but for now let's just insert
      // In a real app, we might delete existing for that day first or use upsert

      // Delete existing for target date first to be safe (simple "replace" logic)
      const { error: deleteError } = await supabase
        .from('daily_menus')
        .delete()
        .eq('date', formattedDate);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase.from('daily_menus').insert(newMenuItems);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-daily-menu', formattedDate] });
    },
  });

  return {
    products: productsQuery.data,
    dailyMenu: dailyMenuQuery.data,
    isLoading: productsQuery.isLoading || dailyMenuQuery.isLoading,
    toggleProduct,
    copyMenu,
  };
};
