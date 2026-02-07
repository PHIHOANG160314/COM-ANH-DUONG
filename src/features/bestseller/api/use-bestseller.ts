import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, hasSupabaseConfig } from '@/shared/api/supabase-client';
import { Debug } from '@/shared/utils/debug';

// Types
export interface BestsellerConfig {
  id: number;
  mode: 'auto' | 'manual';
  auto_count: number;
  auto_cache_hours: number;
  manual_items: number[];
  last_auto_update: string | null;
  updated_at: string;
}

export interface BestsellerItem {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  totalSold?: number;
  rank?: number;
}

// Fallback bestseller items when Supabase not configured
const FALLBACK_BESTSELLERS: BestsellerItem[] = [
  {
    id: 1,
    name: 'Sườn non ram mặn',
    price: 35000,
    image_url: null,
    category_id: 'cat-1',
    totalSold: 120,
  },
  {
    id: 2,
    name: 'Cá sát kho',
    price: 30000,
    image_url: null,
    category_id: 'cat-2',
    totalSold: 95,
  },
  {
    id: 3,
    name: 'Canh khổ qua dồn thịt',
    price: 25000,
    image_url: null,
    category_id: 'cat-3',
    totalSold: 88,
  },
  {
    id: 4,
    name: 'Gà xào sả ớt',
    price: 35000,
    image_url: null,
    category_id: 'cat-4',
    totalSold: 75,
  },
  {
    id: 5,
    name: 'Đùi gà chiên nước mắm',
    price: 35000,
    image_url: null,
    category_id: 'cat-4',
    totalSold: 68,
  },
  {
    id: 6,
    name: 'Thịt kho tiêu',
    price: 30000,
    image_url: null,
    category_id: 'cat-1',
    totalSold: 62,
  },
];

// Default config when not in database
const DEFAULT_CONFIG: BestsellerConfig = {
  id: 1,
  mode: 'auto',
  auto_count: 6,
  auto_cache_hours: 1,
  manual_items: [],
  last_auto_update: null,
  updated_at: new Date().toISOString(),
};

/**
 * Hook to fetch bestseller configuration
 */
export const useBestsellerConfig = () => {
  return useQuery({
    queryKey: ['bestseller-config'],
    queryFn: async (): Promise<BestsellerConfig> => {
      if (!hasSupabaseConfig) {
        Debug.warn('⚠️ Supabase not configured - using default bestseller config');
        return DEFAULT_CONFIG;
      }

      try {
        const { data, error } = await supabase.from('featured_items_config').select('*').single();

        if (error) {
          Debug.warn('⚠️ Error fetching bestseller config:', error.message);
          return DEFAULT_CONFIG;
        }

        return data as BestsellerConfig;
      } catch (err) {
        Debug.warn('⚠️ Failed to fetch bestseller config:', err);
        return DEFAULT_CONFIG;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Hook to update bestseller configuration (Admin only)
 */
export const useUpdateBestsellerConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<BestsellerConfig>) => {
      if (!hasSupabaseConfig) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('featured_items_config')
        .update(updates)
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bestseller-config'] });
      queryClient.invalidateQueries({ queryKey: ['bestseller-items'] });
    },
  });
};

/**
 * Fetch top selling items from database (auto mode)
 */
const fetchTopSellingItems = async (limit: number): Promise<BestsellerItem[]> => {
  try {
    // Try to fetch from top_selling_items VIEW
    const { data: topItems, error: viewError } = await supabase
      .from('top_selling_items')
      .select('item_id, item_name, total_sold, order_count')
      .limit(limit);

    if (viewError) {
      Debug.warn('⚠️ top_selling_items view not available:', viewError.message);
      // Fallback: get random active items
      return fetchRandomActiveItems(limit);
    }

    if (!topItems || topItems.length === 0) {
      Debug.log('📋 No sales data yet - falling back to random items');
      return fetchRandomActiveItems(limit);
    }

    // Fetch full item details
    const itemIds = topItems.map((t) => t.item_id);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price, image_url, category_id')
      .in('id', itemIds);

    if (menuError || !menuItems) {
      return FALLBACK_BESTSELLERS.slice(0, limit);
    }

    // Merge with sales data
    return topItems.map((top, index) => {
      const item = menuItems.find((m) => m.id === top.item_id);
      return {
        id: top.item_id,
        name: item?.name || top.item_name,
        price: item?.price || 0,
        image_url: item?.image_url || null,
        category_id: item?.category_id || null,
        totalSold: top.total_sold,
        rank: index + 1,
      };
    });
  } catch (err) {
    Debug.warn('⚠️ Error fetching top selling items:', err);
    return FALLBACK_BESTSELLERS.slice(0, limit);
  }
};

/**
 * Fetch manually selected items (manual mode)
 */
const fetchManualItems = async (itemIds: number[]): Promise<BestsellerItem[]> => {
  if (!itemIds || itemIds.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, price, image_url, category_id')
      .in('id', itemIds);

    if (error || !data) {
      Debug.warn('⚠️ Error fetching manual items:', error?.message);
      return [];
    }

    // Preserve admin's ordering
    return itemIds
      .map((id, index) => {
        const item = data.find((d) => d.id === id);
        if (!item) return null;
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          category_id: item.category_id,
          rank: index + 1,
        };
      })
      .filter(Boolean) as BestsellerItem[];
  } catch (err) {
    Debug.warn('⚠️ Error fetching manual items:', err);
    return [];
  }
};

/**
 * Fetch random active items (fallback when no sales data)
 */
const fetchRandomActiveItems = async (limit: number): Promise<BestsellerItem[]> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, price, image_url, category_id')
      // Note: is_active column removed
      .limit(limit);

    if (error || !data) {
      return FALLBACK_BESTSELLERS.slice(0, limit);
    }

    return data.map((item, index) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      category_id: item.category_id,
      rank: index + 1,
    }));
  } catch {
    return FALLBACK_BESTSELLERS.slice(0, limit);
  }
};

/**
 * Main hook to fetch bestseller items based on config mode
 */
export const useBestsellers = (limit = 6) => {
  const { data: config } = useBestsellerConfig();

  return useQuery({
    queryKey: ['bestseller-items', config?.mode, config?.manual_items],
    queryFn: async (): Promise<BestsellerItem[]> => {
      if (!hasSupabaseConfig) {
        Debug.warn('⚠️ Supabase not configured - using fallback bestsellers');
        return FALLBACK_BESTSELLERS.slice(0, limit);
      }

      if (!config) {
        return FALLBACK_BESTSELLERS.slice(0, limit);
      }

      // Manual mode: fetch specific items chosen by admin
      if (config.mode === 'manual' && config.manual_items.length > 0) {
        Debug.log('📋 Fetching manual bestsellers:', config.manual_items);
        return fetchManualItems(config.manual_items);
      }

      // Auto mode: fetch from sales data
      Debug.log('🤖 Fetching auto bestsellers (top', config.auto_count, 'items)');
      return fetchTopSellingItems(config.auto_count || limit);
    },
    enabled: !!config,
    staleTime: 60 * 1000, // Cache for 1 minute
  });
};

/**
 * Get badge text based on rank
 */
export const getBestsellerBadge = (rank: number): string => {
  switch (rank) {
    case 1:
      return '🥇 #1';
    case 2:
      return '🥈 #2';
    case 3:
      return '🥉 #3';
    default:
      return '🔥 Hot';
  }
};
