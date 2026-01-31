import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// Demo data for when Supabase is not configured
const DEMO_PRODUCTS: (Product & { categories: Category | null })[] = [
  {
    id: 'demo-1',
    name: 'Cơm Sườn Nướng',
    description: 'Sườn heo nướng than hồng, ăn kèm dưa leo, cà chua',
    price: 45000,
    image_url: '/images/demo/com-suon.jpg',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    categories: { id: 'cat-1', name: 'Cơm Phần', sort_order: 1, is_active: true, created_at: new Date().toISOString() }
  },
  {
    id: 'demo-2',
    name: 'Cơm Gà Xối Mỡ',
    description: 'Đùi gà chiên giòn, nước mắm tỏi ớt đặc biệt',
    price: 40000,
    image_url: '/images/demo/com-ga.jpg',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    categories: { id: 'cat-1', name: 'Cơm Phần', sort_order: 1, is_active: true, created_at: new Date().toISOString() }
  },
  {
    id: 'demo-3',
    name: 'Cơm Tấm Bì Chả',
    description: 'Bì heo, chả trứng, mỡ hành, đồ chua',
    price: 35000,
    image_url: '/images/demo/com-tam.jpg',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    categories: { id: 'cat-1', name: 'Cơm Phần', sort_order: 1, is_active: true, created_at: new Date().toISOString() }
  }
];

const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Cơm Phần', sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Món Thêm', sort_order: 2, is_active: true, created_at: new Date().toISOString() }
];

export const useDailyMenu = () => {
  return useQuery({
    queryKey: ['daily-menu'],
    queryFn: async () => {
      // Return demo data if Supabase is not configured
      if (!hasSupabaseConfig) {
        console.warn('⚠️ Supabase not configured - showing demo menu');
        return DEMO_PRODUCTS;
      }

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
      // Return demo data if Supabase is not configured
      if (!hasSupabaseConfig) {
        console.warn('⚠️ Supabase not configured - showing demo categories');
        return DEMO_CATEGORIES;
      }

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

