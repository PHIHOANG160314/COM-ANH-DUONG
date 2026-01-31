import { supabase } from '@/shared/api/supabase-client';
import type { Database } from '@/shared/types/database.types';

export type CustomerAddress = Database['public']['Tables']['customer_addresses']['Row'];
export type InsertAddress = Database['public']['Tables']['customer_addresses']['Insert'];

export const addressApi = {
  // Get all addresses for current user
  getAddresses: async (userId: string) => {
    // Need customer_id first
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!customer) return [];

    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customer.id)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add new address
  addAddress: async (userId: string, address: Omit<InsertAddress, 'customer_id'>) => {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!customer) throw new Error('Customer profile not found');

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert({
        ...address,
        customer_id: customer.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update address
  updateAddress: async (id: string, updates: Partial<InsertAddress>) => {
    const { data, error } = await supabase
      .from('customer_addresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete address
  deleteAddress: async (id: string) => {
    const { error } = await supabase.from('customer_addresses').delete().eq('id', id);

    if (error) throw error;
  },
};
