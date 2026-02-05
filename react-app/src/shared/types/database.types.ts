export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'staff' | 'customer' | 'shipper' | 'kitchen';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'staff' | 'customer' | 'shipper' | 'kitchen';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'staff' | 'customer' | 'shipper' | 'kitchen';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_active: boolean;
          is_sold_out: boolean;
          stock_quantity: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_active?: boolean;
          is_sold_out?: boolean;
          stock_quantity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_active?: boolean;
          is_sold_out?: boolean;
          stock_quantity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status:
          | 'pending'
          | 'confirmed'
          | 'preparing'
          | 'ready'
          | 'delivering'
          | 'completed'
          | 'cancelled';
          total_amount: number;
          delivery_address: string | null;
          delivery_lat: number | null;
          delivery_lng: number | null;
          contact_phone: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
          points_redeemed: number; // Added field
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?:
          | 'pending'
          | 'confirmed'
          | 'preparing'
          | 'ready'
          | 'delivering'
          | 'completed'
          | 'cancelled';
          total_amount: number;
          delivery_address?: string | null;
          delivery_lat?: number | null;
          delivery_lng?: number | null;
          contact_phone?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          points_redeemed?: number; // Added field
        };
        Update: {
          id?: string;
          user_id?: string | null;
          status?:
          | 'pending'
          | 'confirmed'
          | 'preparing'
          | 'ready'
          | 'delivering'
          | 'completed'
          | 'cancelled';
          total_amount?: number;
          delivery_address?: string | null;
          delivery_lat?: number | null;
          delivery_lng?: number | null;
          contact_phone?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          points_redeemed?: number; // Added field
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: number | null;
          item_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes: string | null;
          options: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id?: number | null;
          item_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes?: string | null;
          options?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: number | null;
          item_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          notes?: string | null;
          options?: Json | null;
          created_at?: string;
        };
      };
      loyalty_transactions: {
        Row: {
          id: string;
          customer_id: string;
          order_id: string | null;
          type: 'earn' | 'redeem' | 'adjustment' | 'expire' | 'bonus';
          points: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          order_id?: string | null;
          type: 'earn' | 'redeem' | 'adjustment' | 'expire' | 'bonus';
          points: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          order_id?: string | null;
          type?: 'earn' | 'redeem' | 'adjustment' | 'expire' | 'bonus';
          points?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      customer_addresses: {
        Row: {
          id: string;
          customer_id: string;
          label: string;
          address: string;
          phone: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          label?: string;
          address: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          label?: string;
          address?: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: number;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_active: boolean;
          is_sold_out: boolean;
          stock_quantity: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_active?: boolean;
          is_sold_out?: boolean;
          stock_quantity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_active?: boolean;
          is_sold_out?: boolean;
          stock_quantity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_items: {
        Row: {
          id: string;
          customer_id: string;
          menu_item_id: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          menu_item_id: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          menu_item_id?: number;
          created_at?: string;
        };
      };
      daily_menus: {
        Row: {
          id: string;
          date: string;
          product_id: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          product_id: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          product_id?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_: string]: {
        Row: {
          [key: string]: Json;
        };
      };
    };
    Functions: {
      create_order_atomic: {
        Args: {
          p_order_payload: Json;
          p_items_payload: Json;
        };
        Returns: Json;
      };
      [_: string]: {
        Args: {
          [key: string]: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_: string]: string;
    };
  };
}
