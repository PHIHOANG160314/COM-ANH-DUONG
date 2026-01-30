// Database Types for Supabase
export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category: string;
          image_url: string | null;
          available: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string | null;
          total_price: number;
          status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      staff: {
        Row: {
          id: string;
          name: string;
          role: 'manager' | 'cashier' | 'waiter' | 'kitchen';
          pin: string;
          is_checked_in: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id' | 'created_at' | 'is_checked_in'>;
        Update: Partial<Database['public']['Tables']['staff']['Insert']>;
      };
    };
  };
}

// Domain Models
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Staff = Database['public']['Tables']['staff']['Row'];

export type OrderStatus = Database['public']['Tables']['orders']['Row']['status'];
export type StaffRole = Database['public']['Tables']['staff']['Row']['role'];

// View Models
export interface OrderWithItems extends Order {
  items: Array<OrderItem & { menu_item: MenuItem }>;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
