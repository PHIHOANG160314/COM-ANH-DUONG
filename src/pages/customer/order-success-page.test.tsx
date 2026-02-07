import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderSuccessPage } from './order-success-page';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock child components to simplify testing
vi.mock('@/shared/ui/zalo-chat-fab', () => ({
  ZaloChatFab: () => <div data-testid="zalo-chat-fab">Zalo Chat</div>,
}));

vi.mock('@/shared/ui/trust-badges', () => ({
  TrustBadges: () => <div data-testid="trust-badges">Trust Badges</div>,
}));

// Mock the useOrder hook
vi.mock('@/features/orders/api/use-order', () => ({
  useOrder: () => ({
    data: {
      id: '12345678-1234-1234-1234-123456789012',
      created_at: '2024-02-02T08:00:00Z',
      profiles: { full_name: 'Nguyen Van A' },
      order_items: [],
      total_amount: 50000,
    },
    isLoading: false,
  }),
}));

// Mock PrintReceipt component
vi.mock('@/features/orders/components/print-receipt', () => ({
  PrintReceipt: () => <button>In hóa đơn</button>,
}));

const renderWithRouter = (state = {}) => {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/order-success', state }]}>
      <Routes>
        <Route path="/order-success" element={<OrderSuccessPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('OrderSuccessPage', () => {
  it('renders success message', () => {
    renderWithRouter({ orderId: '12345678', totalAmount: 50000, paymentMethod: 'cash' });
    expect(screen.getByText('Đặt hàng thành công!')).toBeInTheDocument();
    expect(screen.getByText(/đơn hàng của bạn/i)).toBeInTheDocument();
    // Use getAllByText because ID appears twice (in message and details)
    expect(screen.getAllByText(/#12345678/).length).toBeGreaterThan(0);
  });

  it('displays cash payment instructions when method is cash', () => {
    renderWithRouter({ orderId: '12345678', totalAmount: 50000, paymentMethod: 'cash' });
    expect(screen.getByText('💵 Chuẩn bị tiền mặt')).toBeInTheDocument();
    // Use regex to match 50.000 regardless of specific currency symbol or spacing
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it('renders TrustBadges and ZaloChatFab', () => {
    renderWithRouter();
    expect(screen.getByTestId('zalo-chat-fab')).toBeInTheDocument();
    expect(screen.getByTestId('trust-badges')).toBeInTheDocument();
  });

  it('renders print receipt button', () => {
    renderWithRouter({ orderId: '12345678' });
    expect(screen.getByText('In hóa đơn')).toBeInTheDocument();
  });
});
