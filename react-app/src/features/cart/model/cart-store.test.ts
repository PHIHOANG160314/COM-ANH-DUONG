import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from './cart-store';
import { act } from '@testing-library/react';

// Mock product data
const mockProduct1 = {
  id: 'p1',
  name: 'Com Suon',
  price: 35000,
  description: 'Com suon nuong',
  category_id: 'c1',
  image_url: 'url1',
  is_active: true,
  is_sold_out: false,
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

const mockProduct2 = {
  id: 'p2',
  name: 'Com Ga',
  price: 40000,
  description: 'Com ga xoi mo',
  category_id: 'c1',
  image_url: 'url2',
  is_active: true,
  is_sold_out: false,
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

describe('cartStore', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.getState().clearCart();
    });
  });

  it('starts with empty cart', () => {
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().totalItems()).toBe(0);
    expect(useCartStore.getState().totalAmount()).toBe(0);
  });

  it('adds item to cart', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
    });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].id).toBe(mockProduct1.id);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    expect(useCartStore.getState().totalItems()).toBe(1);
    expect(useCartStore.getState().totalAmount()).toBe(mockProduct1.price);
  });

  it('increments quantity when adding existing item', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().addItem(mockProduct1, 2);
    });

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3); // 1 + 2
    expect(useCartStore.getState().totalItems()).toBe(3);
    expect(useCartStore.getState().totalAmount()).toBe(mockProduct1.price * 3);
  });

  it('adds multiple different items', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().addItem(mockProduct2);
    });

    expect(useCartStore.getState().items).toHaveLength(2);
    expect(useCartStore.getState().totalItems()).toBe(2);
    expect(useCartStore.getState().totalAmount()).toBe(mockProduct1.price + mockProduct2.price);
  });

  it('removes item from cart', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().removeItem(mockProduct1.id);
    });

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().totalItems()).toBe(0);
  });

  it('updates quantity', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().updateQuantity(mockProduct1.id, 5);
    });

    expect(useCartStore.getState().items[0].quantity).toBe(5);
    expect(useCartStore.getState().totalAmount()).toBe(mockProduct1.price * 5);
  });

  it('removes item when quantity updated to 0', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().updateQuantity(mockProduct1.id, 0);
    });

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('clears cart', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().addItem(mockProduct2);
      useCartStore.getState().clearCart();
    });

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().totalItems()).toBe(0);
    expect(useCartStore.getState().totalAmount()).toBe(0);
  });

  it('handles localStorage quota exceeded gracefully', () => {
    // Mock console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock alert
    const alertMock = vi.fn();
    vi.stubGlobal('alert', alertMock);

    // Mock localStorage.setItem to throw QuotaExceededError
    // We spy on the instance method directly to be sure
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      throw error;
    });

    // Verify the mock works directly
    try {
      window.localStorage.setItem('test', 'value');
    } catch (e) {
      // expected
    }
    expect(setItemSpy).toHaveBeenCalled();
    setItemSpy.mockClear();

    // We need to force a write to storage.
    // Zustand persist middleware writes on state change.
    try {
      act(() => {
        useCartStore.getState().addItem(mockProduct1);
      });
    } catch (e) {
      // The error is re-thrown by our implementation, so we expect it here
      expect(e).toBeDefined();
    }

    expect(consoleSpy).toHaveBeenCalledWith('Cart storage quota exceeded');
    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Giỏ hàng đầy'));

    // Cleanup
    consoleSpy.mockRestore();
    setItemSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
