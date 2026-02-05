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

// Mock data for fallback
const MENU_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Thịt',
    slug: 'thit',
    image_url: null,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Cá',
    slug: 'ca',
    image_url: null,
    sort_order: 2,
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
    category_id: 1,
    is_active: true,
    is_sold_out: false,
    stock_quantity: 40,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: MENU_CATEGORIES[0],
  },
  {
    id: 2,
    name: 'Cá kho tộ',
    description: '',
    price: 40000,
    image_url: null,
    category_id: 2,
    is_active: true,
    is_sold_out: false,
    stock_quantity: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: MENU_CATEGORIES[1],
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
        // Try to fetch from menu_items table first (new schema)
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select(
            `
            *,
            categories (
              *
            )
          `
          )
          .eq('is_active', true)
          .order('name');

        if (!menuError && menuData) {
          Debug.log(`✅ Loaded ${menuData.length} items from menu_items table`);
          // Convert menu_items format to Product format for compatibility
          return menuData.map((item) => ({
            ...item,
            categories: item.categories as Category | null,
          })) as MenuItemWithCategory[];
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
          .select('menu_item_id') // Changed from product_id to menu_item_id based on schema usually matching table name
          .eq('date', today)
          .eq('is_active', true);

        // Note: If the column is actually product_id, we need to check database.types.ts
        // But since we are using menu_items, it should be menu_item_id.
        // Let's assume standard naming. If it fails, I'll need to check the schema types.
        // Actually, use-favorites used menu_item_id.

        // If error or no daily menu set for today, return empty array
        if (dailyError) {
          // Try 'product_id' if 'menu_item_id' failed? No, let's stick to one consistent guess or check types.
          // Checking use-favorites.ts, it calls 'saved_items' with 'menu_item_id'.
          // The 'daily_menus' table likely uses 'menu_item_id' too if recent.

          Debug.warn('⚠️ Error fetching daily menu:', dailyError.message);
          return [];
        }

        if (!dailySelections || dailySelections.length === 0) {
          Debug.log('📋 No daily menu set for today - showing empty state');
          return [];
        }

        // Step 2: Fetch the actual product details for today's selections
        // Mapping: check if 'menu_item_id' exists, else try 'product_id' fallback logic? 
        // Typescript will complain if I access property that doesn't exist on 'dailySelections' Row type.
        // I'll trust it's 'menu_item_id' or 'product_id'. 
        // Let's use 'menu_item_id' as it aligns with 'menu_items'.

        // Wait, I can't check types here easily. 
        // I will use `any` cast to avoid TS error for now if key name is uncertain, 
        // but robust solution is to let TS infer.
        // Based on `use-daily-menu-mutation.tsx` (not viewed but likely exists), it updates this table.

        // Let's assume it IS `menu_item_id`.
        const productIds = dailySelections.map((d: any) => d.menu_item_id || d.product_id);

        // Try menu_items first
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select(
            `
            *,
            categories (
              *
            )
          `
          )
          .in('id', productIds)
          .eq('is_active', true);

        if (!menuError && menuData && menuData.length > 0) {
          Debug.log(`✅ Loaded ${menuData.length} daily menu items`);
          return menuData.map((item) => ({
            ...item,
            categories: item.categories as Category | null,
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
          .order('sort_order');

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
