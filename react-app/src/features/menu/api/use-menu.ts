import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// Demo data for when Supabase is not configured - uses AI-generated images
const DEMO_PRODUCTS: (Product & { categories: Category | null })[] = [
  {
    id: 'demo-1',
    name: 'Cơm Sườn Nướng',
    description: 'Sườn heo nướng than hồng, ăn kèm dưa leo, cà chua',
    price: 45000,
    image_url: '/images/menu/com_suon_nuong.png',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-1',
      name: 'Cơm Phần',
      slug: 'com-phan',
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-2',
    name: 'Cơm Gà Xối Mỡ',
    description: 'Đùi gà chiên giòn, nước mắm tỏi ớt đặc biệt',
    price: 40000,
    image_url: '/images/menu/com_ga_xoi_mo.png',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-1',
      name: 'Cơm Phần',
      slug: 'com-phan',
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-3',
    name: 'Cơm Tấm Bì Chả',
    description: 'Bì heo, chả trứng, mỡ hành, đồ chua',
    price: 35000,
    image_url: '/images/menu/com_tam_bi_cha.png',
    category_id: 'cat-1',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-1',
      name: 'Cơm Phần',
      slug: 'com-phan',
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-4',
    name: 'Phở Bò Tái',
    description: 'Phở bò tái chín, nước dùng xương hầm 8 tiếng',
    price: 50000,
    image_url: '/images/menu/pho_bo_tai.png',
    category_id: 'cat-2',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-2',
      name: 'Phở & Bún',
      slug: 'pho-bun',
      image_url: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-5',
    name: 'Bún Bò Huế',
    description: 'Bún bò Huế cay nồng, giò heo, huyết',
    price: 55000,
    image_url: '/images/menu/bun_bo_hue.png',
    category_id: 'cat-2',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-2',
      name: 'Phở & Bún',
      slug: 'pho-bun',
      image_url: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-6',
    name: 'Bánh Mì Đặc Biệt',
    description: 'Pate, chả lụa, thịt nguội, rau thơm',
    price: 25000,
    image_url: '/images/menu/banh_mi_dac_biet.png',
    category_id: 'cat-3',
    is_active: true,
    is_sold_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: 'cat-3',
      name: 'Bánh Mì',
      slug: 'banh-mi',
      image_url: null,
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
];

const DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Cơm Phần',
    slug: 'com-phan',
    image_url: null,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Phở & Bún',
    slug: 'pho-bun',
    image_url: null,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Bánh Mì',
    slug: 'banh-mi',
    image_url: null,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
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

      try {
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

        // If error from Supabase (e.g., 401 with placeholder credentials), fallback to demo
        if (error) {
          console.warn('⚠️ Supabase error - falling back to demo menu:', error.message);
          return DEMO_PRODUCTS;
        }

        return data as (Product & { categories: Category | null })[];
      } catch (err) {
        // Catch any network or auth errors and fallback to demo
        console.warn('⚠️ Failed to fetch menu - falling back to demo:', err);
        return DEMO_PRODUCTS;
      }
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

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        // If error from Supabase (e.g., 401 with placeholder credentials), fallback to demo
        if (error) {
          console.warn('⚠️ Supabase error - falling back to demo categories:', error.message);
          return DEMO_CATEGORIES;
        }

        return data as Category[];
      } catch (err) {
        // Catch any network or auth errors and fallback to demo
        console.warn('⚠️ Failed to fetch categories - falling back to demo:', err);
        return DEMO_CATEGORIES;
      }
    },
  });
};
