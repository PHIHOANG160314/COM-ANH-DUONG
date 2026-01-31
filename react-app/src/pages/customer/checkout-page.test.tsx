import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckoutPage } from './checkout-page';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock hooks
vi.mock('@/features/cart/model/cart-store', () => ({
  useCartStore: vi.fn(),
}));

vi.mock('@/app/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/profile/hooks/use-addresses', () => ({
  useAddresses: vi.fn(),
}));

vi.mock('@/features/profile/hooks/use-loyalty', () => ({
  useLoyalty: vi.fn(),
}));

// Mock API and utils
vi.mock('@/shared/api/supabase-client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'customer-123' } }),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: 'order-123' }, error: null }),
        })),
      })),
    })),
  },
}));

vi.mock('@/features/payment/api/payment-api', () => ({
  paymentApi: {
    createPayment: vi.fn(),
  },
}));

vi.mock('@/shared/ui/operating-hours', () => ({
  getStoreStatus: vi.fn(() => ({ status: 'open', message: 'Open' })),
  OperatingHours: () => <div data-testid="operating-hours">Operating Hours</div>,
}));

vi.mock('@/shared/ui/trust-badges', () => ({
  TrustBadges: () => <div data-testid="trust-badges">Trust Badges</div>,
}));

vi.mock('@/features/payment/components/payment-method-selector', () => ({
  PaymentMethodSelector: ({ onChange }: { onChange: (val: string) => void }) => (
    <div data-testid="payment-selector">
      <button onClick={() => onChange('cash')}>Select Cash</button>
      <button onClick={() => onChange('vnpay')}>Select VNPay</button>
    </div>
  ),
}));

import { useCartStore } from '@/features/cart/model/cart-store';
import { useAuth } from '@/app/providers/auth-provider';
import { useAddresses } from '@/features/profile/hooks/use-addresses';
import { useLoyalty } from '@/features/profile/hooks/use-loyalty';

describe('CheckoutPage', () => {
  const mockClearCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks - using type-safe casting pattern
    vi.mocked(useCartStore).mockReturnValue({
      items: [{ id: '1', name: 'Com Tam', price: 50000, quantity: 2, note: '' }],
      totalAmount: () => 100000,
      clearCart: mockClearCart,
    } as unknown as ReturnType<typeof useCartStore>);

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-123', user_metadata: { full_name: 'Test User' } },
    } as unknown as ReturnType<typeof useAuth>);

    vi.mocked(useAddresses).mockReturnValue({
      addresses: [],
    } as unknown as ReturnType<typeof useAddresses>);

    vi.mocked(useLoyalty).mockReturnValue({
      stats: { points: 0 },
    } as unknown as ReturnType<typeof useLoyalty>);
  });

  it('renders empty cart message when no items', () => {
    vi.mocked(useCartStore).mockReturnValue({
      items: [],
      totalAmount: () => 0,
      clearCart: mockClearCart,
    } as unknown as ReturnType<typeof useCartStore>);

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Giỏ hàng trống')).toBeInTheDocument();
  });

  it('renders checkout form with items', () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Thông tin giao hàng')).toBeInTheDocument();
    expect(screen.getByText('2x Com Tam')).toBeInTheDocument();
    // Price appears multiple times (item list, subtotal, total)
    expect(screen.getAllByText('100.000 ₫').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    const submitBtn = screen.getByText('Đặt đơn - Trả tiền mặt');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Số điện thoại không hợp lệ')).toBeInTheDocument();
      expect(screen.getByText('Vui lòng nhập địa chỉ giao hàng')).toBeInTheDocument();
    });
  });

  it('calculates totals correctly', () => {
    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    // Subtotal and Total should both be 100.000 ₫
    const prices = screen.getAllByText('100.000 ₫');
    expect(prices.length).toBeGreaterThanOrEqual(2);

    // Total label
    expect(screen.getByText('Tổng cộng')).toBeInTheDocument();
  });
});
