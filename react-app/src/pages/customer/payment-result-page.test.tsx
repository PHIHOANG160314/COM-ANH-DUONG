import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentResultPage } from './payment-result-page';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCartStore } from '@/features/cart/model/cart-store';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/cart/model/cart-store', () => ({
  useCartStore: vi.fn(),
}));

describe('PaymentResultPage', () => {
  const mockClearCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCartStore).mockReturnValue({
      clearCart: mockClearCart,
    } as unknown as ReturnType<typeof useCartStore>);
  });

  it('clears cart on successful payment', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout/result?vnp_ResponseCode=00&vnp_TxnRef=123']}>
        <Routes>
           <Route path="/checkout/result" element={<PaymentResultPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Thanh toán thành công! Cảm ơn bạn đã đặt hàng.')).toBeInTheDocument();
    });

    expect(mockClearCart).toHaveBeenCalled();
  });

  it('does NOT clear cart on failed payment', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout/result?vnp_ResponseCode=99&vnp_TxnRef=123']}>
        <Routes>
           <Route path="/checkout/result" element={<PaymentResultPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Expect finding the heading with the text
      expect(screen.getByRole('heading', { name: 'Thanh Toán Thất Bại' })).toBeInTheDocument();
    });

    expect(mockClearCart).not.toHaveBeenCalled();
  });
});
