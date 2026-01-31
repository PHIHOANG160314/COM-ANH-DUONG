import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useDailyMenu, useCategories } from './use-menu';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as SupabaseClient from '@/shared/api/supabase-client';

// Type for our mock helper
interface MocksType {
  mockFrom: Mock;
  mockSelect: Mock;
  mockEq: Mock;
  mockOrder: Mock;
}

// Mock the supabase client module
vi.mock('@/shared/api/supabase-client', () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();

  // Chain setup
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ order: mockOrder });

  // Default success response
  mockOrder.mockResolvedValue({ data: [], error: null });

  return {
    supabase: {
      from: mockFrom,
    },
    hasSupabaseConfig: true,
    // Helper to access mocks
    _mocks: {
      mockFrom,
      mockSelect,
      mockEq,
      mockOrder,
    },
  };
});

// Proper wrapper component
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useMenu Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset hasSupabaseConfig to true by default (we'll hack it if needed or use separate tests)
    // Since we mocked it as a value, we can't easily change it dynamically without getters in the mock.
    // However, we can test the "error fallback" which is the main goal.
    // The "not configured" check is static, but the "error" check is dynamic.
  });

  describe('useDailyMenu', () => {
    it('returns demo data when Supabase returns an error', async () => {
      // Access the mocked functions
      // We need to cast to any to access the hidden _mocks property we added
      const { _mocks } = SupabaseClient as unknown as { _mocks: MocksType };

      // Setup mock to return error
      _mocks.mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Connection refused' },
      });

      const { result } = renderHook(() => useDailyMenu(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should return demo data (non-empty array)
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.data?.[0].id).toContain('demo');
    });

    it('returns demo data when fetch throws an exception', async () => {
      const { _mocks } = SupabaseClient as unknown as { _mocks: MocksType };

      // Setup mock to throw
      _mocks.mockOrder.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDailyMenu(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.data?.[0].id).toContain('demo');
    });

    it('returns real data when Supabase succeeds', async () => {
      const { _mocks } = SupabaseClient as unknown as { _mocks: MocksType };

      const realData = [{ id: 'real-1', name: 'Real Food', categories: { id: 'c1' } }];

      // Setup mock to return data
      _mocks.mockOrder.mockResolvedValue({
        data: realData,
        error: null,
      });

      const { result } = renderHook(() => useDailyMenu(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(realData);
    });
  });

  describe('useCategories', () => {
    it('returns demo data when Supabase returns an error', async () => {
      // The chain for useCategories is slightly different: .from().select().eq().order()
      // It matches the same chain structure we mocked: from -> select -> eq -> order
      // NOTE: useCategories implementation: from('categories').select('*').eq('is_active', true).order('sort_order')
      // useDailyMenu implementation: from('products').select(...).eq('is_active', true).order('name')

      // They use the same chain structure, so our mock works for both.

      const { _mocks } = SupabaseClient as unknown as { _mocks: MocksType };

      _mocks.mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Auth error' },
      });

      const { result } = renderHook(() => useCategories(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.data?.[0].id).toContain('cat');
    });
  });
});
