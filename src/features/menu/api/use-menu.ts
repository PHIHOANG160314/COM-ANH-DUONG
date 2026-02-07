import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';
import { Debug } from '@/shared/utils/debug';
import dayjs from 'dayjs';

type Product = Database['public']['Tables']['menu_items']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// Type for fallback data structure
// We ensure 'categories' matches the shape expected (object or null)
export type MenuItemWithCategory = Product & { categories: Category | null };

// Mock data for fallback - matches actual database structure
const MENU_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Thức Ăn',
    icon: '🍜',
    parent_id: null,
    order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'homemade',
    name: 'Món Nhà',
    icon: '🍚',
    parent_id: 'food',
    order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rice',
    name: 'Cơm',
    icon: '🍚',
    parent_id: 'food',
    order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'drinks',
    name: 'Đồ Uống',
    icon: '🥤',
    parent_id: null,
    order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const MENU_PRODUCTS: MenuItemWithCategory[] = [
  {
    id: 1,
    name: 'Sườn non ram mặn',
    description: '',
    price: 35000,
    image_url: null,
    category_id: 'homemade',
    is_active: true,
    is_sold_out: false,
    stock_quantity: 40,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: MENU_CATEGORIES[1], // homemade
  },
  {
    id: 2,
    name: 'Cá kho tộ',
    description: '',
    price: 40000,
    image_url: null,
    category_id: 'rice',
    is_active: true,
    is_sold_out: false,
    stock_quantity: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: MENU_CATEGORIES[2], // rice
  },
];

export const useAllMenuItems = () => {
  return useQuery({
    queryKey: ['all-menu-items'],
    queryFn: async () => {
      // Return production menu if Supabase is not configured
      if (!hasSupabaseConfig) {
        Debug.warn('⚠️ Supabase not configured - showing production menu');
        return MENU_PRODUCTS;
      }

      try {
        // Fetch menu_items WITH categories join (using explicit FK)
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*, categories:categories!menu_items_category_id_fkey(id, name, icon)')
          .order('name');

        if (!menuError && menuData) {
          Debug.log(`✅ Loaded ${menuData.length} items from menu_items table`);
          return menuData as MenuItemWithCategory[];
        }

        // Fallback to old products table if menu_items doesn't exist
        // Note: This logic assumes 'products' uses string IDs, which might cause type mismatch
        // But we are returning MenuItemWithCategory which expects number. 
        // If products table ID is uuid string, this might fail at runtime or type check.
        // Assuming we are moving away from 'products', we'll rely on menu_items.
        // If menu_items fetch failed, we return mock data rather than potentially incompatible products table data.

        Debug.warn('⚠️ Failed to fetch menu_items, falling back to mock data');
        return MENU_PRODUCTS;

      } catch (err) {
        // Catch any network or auth errors and fallback to production
        Debug.warn('⚠️ Failed to fetch menu - falling back to production:', err);
        return MENU_PRODUCTS;
      }
    },
    initialData: MENU_PRODUCTS,
  });
};

// Hook for /menu page - shows only items selected by admin for TODAY
export const useDailyMenu = () => {
  const today = dayjs().format('YYYY-MM-DD');

  return useQuery({
    queryKey: ['daily-menu', today],
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    queryFn: async () => {
      // In demo mode (no Supabase), show all items as daily menu
      if (!hasSupabaseConfig) {
        Debug.warn('⚠️ Supabase not configured - showing all items as daily menu');
        return MENU_PRODUCTS;
      }

      try {
        // Step 1: Fetch today's daily menu selections from daily_menus table
        const { data: dailySelections, error: dailyError } = await supabase
          .from('daily_menus')
          .select('*')
          .eq('date', today);

        // If error or no daily menu set for today, return empty array
        if (dailyError) {
          Debug.warn('⚠️ Error fetching daily menu:', dailyError.message);
          return [];
        }

        if (!dailySelections || dailySelections.length === 0) {
          Debug.log('📋 No daily menu set for today - showing empty state');
          return [];
        }

        // Filter only active items
        const activeSelections = dailySelections.filter(d => d.is_active);

        if (activeSelections.length === 0) {
          return [];
        }

        // Step 2: Fetch the actual product details for today's selections
        // product_id is INTEGER in database, can use directly
        const productIds = activeSelections.map((d) => d.product_id);

        // Try menu_items first
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .in('id', productIds);

        if (!menuError && menuData && menuData.length > 0) {
          Debug.log(`✅ Loaded ${menuData.length} daily menu items`);
          return menuData.map((item) => ({
            ...item,
            categories: null,
          })) as MenuItemWithCategory[];
        }

        return [];
      } catch (err) {
        Debug.warn('⚠️ Failed to fetch daily menu:', err);
        return [];
      }
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Return production categories if Supabase is not configured
      if (!hasSupabaseConfig) {
        Debug.warn('⚠️ Supabase not configured - showing production categories');
        return MENU_CATEGORIES;
      }

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('order');

        // If error from Supabase, fallback to production
        if (error) {
          Debug.warn('⚠️ Supabase error - falling back to production categories:', error.message);
          return MENU_CATEGORIES;
        }

        return data as Category[];
      } catch (err) {
        // Catch any network or auth errors and fallback to production
        Debug.warn('⚠️ Failed to fetch categories - falling back to production:', err);
        return MENU_CATEGORIES;
      }
    },
    initialData: MENU_CATEGORIES,
  });
};
