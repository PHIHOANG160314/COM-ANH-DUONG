import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

export type LoyaltyTransaction = Database['public']['Tables']['loyalty_transactions']['Row'];
export type CustomerAddress = Database['public']['Tables']['customer_addresses']['Row'];

export interface LoyaltyStats {
  tier: string;
  points: number;
  totalSpent: number;
  nextTierProgress: number; // 0-100
}

export const loyaltyApi = {
  // Get current customer loyalty stats
  getStats: async (userId: string) => {
    // First get the customer record linked to auth user
    const { data: customer, error } = await supabase
      .from('customers')
      .select('tier, points, total_spent, visits')
      .eq('auth_user_id', userId)
      .single();

    if (error) throw error;
    if (!customer) return null;

    // Calculate progress (Frontend logic for now, mirroring backend rules)
    // Bronze: 0-5, Silver: 6-15, Gold: 16+
    let progress = 0;
    const visits = customer.visits || 0;

    if (customer.tier === 'Bronze' || !customer.tier) {
      // Goal 6
      progress = Math.min(100, (visits / 6) * 100);
    } else if (customer.tier === 'Silver') {
      // Goal 16 (from 6) -> 10 visits needed
      progress = Math.min(100, ((visits - 5) / 10) * 100);
    } else {
      progress = 100; // Max tier
    }

    return {
      tier: customer.tier || 'Bronze',
      points: customer.points || 0,
      totalSpent: customer.total_spent || 0,
      nextTierProgress: progress,
    };
  },

  // Get transaction history
  getHistory: async (userId: string) => {
    // Need customer_id first
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!customer) return [];

    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Redeem points (Call RPC)
  redeemPoints: async (points: number) => {
    const { data, error } = await supabase.rpc('redeem_loyalty_points', {
      p_points_to_redeem: points,
    });

    if (error) throw error;
    return data;
  },
};
