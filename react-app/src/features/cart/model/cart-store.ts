import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database } from '@/shared/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem extends Product {
  quantity: number;
  note?: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, note?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, note = '') => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
              ),
            };
          }
          return {
            items: [...state.items, { ...product, quantity, note }],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.id === productId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      totalAmount: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
