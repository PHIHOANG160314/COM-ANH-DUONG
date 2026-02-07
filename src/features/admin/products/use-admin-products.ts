import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

export type Product = Database['public']['Tables']['menu_items']['Row'];
export type ProductInsert = Database['public']['Tables']['menu_items']['Insert'];
export type ProductUpdate = Database['public']['Tables']['menu_items']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(
          `
          *,
          categories (
            name
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createProduct = useMutation({
    mutationFn: async (newProduct: ProductInsert) => {
      const { data, error } = await supabase.from('menu_items').insert(newProduct).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate & { id: number }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  return {
    products: productsQuery.data,
    isLoading: productsQuery.isLoading,
    categories: categoriesQuery.data,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
