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
          role: 'admin' | 'staff' | 'customer' | 'shipper';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'staff' | 'customer' | 'shipper';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'staff' | 'customer' | 'shipper';
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
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          note?: string | null;
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
