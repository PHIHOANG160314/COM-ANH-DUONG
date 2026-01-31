import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderSuccessPage } from './order-success-page';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock child components to simplify testing
vi.mock('@/shared/ui/zalo-chat-fab', () => ({
  ZaloChatFab: () => <div data-testid="zalo-chat-fab">Zalo Chat</div>
}));

vi.mock('@/shared/ui/trust-badges', () => ({
  TrustBadges: () => <div data-testid="trust-badges">Trust Badges</div>
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
    renderWithRouter({ orderId: '12345', totalAmount: 50000, paymentMethod: 'cash' });
    expect(screen.getByText('Đặt hàng thành công!')).toBeInTheDocument();
    expect(screen.getByText(/đơn hàng của bạn/i)).toBeInTheDocument();
    // Use getAllByText because ID appears twice (in message and details)
    expect(screen.getAllByText(/#12345/).length).toBeGreaterThan(0);
  });

  it('displays cash payment instructions when method is cash', () => {
    renderWithRouter({ orderId: '12345', totalAmount: 50000, paymentMethod: 'cash' });
    expect(screen.getByText('💵 Chuẩn bị tiền mặt')).toBeInTheDocument();
    // Use regex to match 50.000 regardless of specific currency symbol or spacing
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it('renders TrustBadges and ZaloChatFab', () => {
    renderWithRouter();
    expect(screen.getByTestId('zalo-chat-fab')).toBeInTheDocument();
    expect(screen.getByTestId('trust-badges')).toBeInTheDocument();
  });
});
