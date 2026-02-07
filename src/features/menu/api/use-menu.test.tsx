import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useDailyMenu, useCategories, useAllMenuItems } from './use-menu';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as SupabaseClient from '@/shared/api/supabase-client';

// Type for our mock helper
interface MocksType {
  mockFrom: Mock;
  mockSelect: Mock;
  mockEq: Mock;
  mockOrder: Mock;
  mockIn: Mock;
}

// Mock the supabase client module
vi.mock('@/shared/api/supabase-client', () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockIn = vi.fn();

  // Chain setup for menu_items query
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq, in: mockIn });
  mockEq.mockReturnValue({ order: mockOrder, eq: mockEq, in: mockIn });
  mockIn.mockReturnValue({ eq: mockEq });

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
      mockIn,
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
  });

  describe('useAllMenuItems', () => {
    it('returns demo data when Supabase returns an error', async () => {
      const { _mocks } = SupabaseClient as unknown as { _mocks: MocksType };

      // Setup mock to return error
      _mocks.mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Connection refused' },
      });

      const { result } = renderHook(() => useAllMenuItems(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should return demo data (non-empty array)
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.data?.[0].id).toContain('menu');
    });

    it('returns real data when Supabase succeeds', async () => {
      const { _mocks } = SupabaseClient as unknown as { _mocks: MocksType };

      const realData = [{ id: 'real-1', name: 'Real Food', categories: { id: 'c1' } }];

      // Setup mock to return data
      _mocks.mockOrder.mockResolvedValue({
        data: realData,
        error: null,
      });

      const { result } = renderHook(() => useAllMenuItems(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(realData);
    });
  });

  describe('useDailyMenu', () => {
    it('returns empty array when no daily menu is set for today', async () => {
      const { _mocks } = SupabaseClient as unknown as { _mocks: MocksType };

      // Setup mock to return empty daily_menus
      _mocks.mockEq.mockReturnValue({ eq: _mocks.mockEq });
      _mocks.mockEq.mockResolvedValue({
        data: [],
        error: null,
      });

      const { result } = renderHook(() => useDailyMenu(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should return empty array (no daily menu set)
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(0);
    });

    it('returns empty array when daily_menus query fails', async () => {
      const { _mocks } = SupabaseClient as unknown as { _mocks: MocksType };

      // Setup mock to return error
      _mocks.mockEq.mockReturnValue({ eq: _mocks.mockEq });
      _mocks.mockEq.mockResolvedValue({
        data: null,
        error: { message: 'Connection refused' },
      });

      const { result } = renderHook(() => useDailyMenu(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should return empty array on error
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(0);
    });
  });

  describe('useCategories', () => {
    it('returns demo data when Supabase returns an error', async () => {
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
