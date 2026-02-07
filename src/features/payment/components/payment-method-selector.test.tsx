import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaymentMethodSelector } from './payment-method-selector';
import '@testing-library/jest-dom';

describe('PaymentMethodSelector', () => {
  it('renders all payment options', () => {
    const handleChange = vi.fn();
    render(<PaymentMethodSelector value="cash" onChange={handleChange} />);

    expect(screen.getByText(/Tiền mặt khi nhận hàng/)).toBeInTheDocument();
    expect(screen.getByText(/Thanh toán qua VNPay/)).toBeInTheDocument();
    expect(screen.getByText(/Ví MoMo/)).toBeInTheDocument();
  });

  it('displays "Phổ biến" badge for Cash option', () => {
    const handleChange = vi.fn();
    render(<PaymentMethodSelector value="cash" onChange={handleChange} />);

    expect(screen.getByText('Phổ biến')).toBeInTheDocument();
  });

  it('highlights selected option', () => {
    const handleChange = vi.fn();
    render(<PaymentMethodSelector value="cash" onChange={handleChange} />);

    // Material UI Radio usually works with input elements
    const cashInput = screen.getByLabelText(/Tiền mặt khi nhận hàng/);
    expect(cashInput).toBeChecked();
  });

  it('calls onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<PaymentMethodSelector value="cash" onChange={handleChange} />);

    const vnpayInput = screen.getByLabelText(/Thanh toán qua VNPay/);
    fireEvent.click(vnpayInput);

    expect(handleChange).toHaveBeenCalledWith('vnpay');
  });
});
