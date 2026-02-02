import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { OperatingHours } from './operating-hours';
import { getStoreStatus } from '../utils/store-hours';
import '@testing-library/jest-dom';

// Mock useStoreStatus for the component tests
vi.mock('@/shared/hooks/use-store-status', () => ({
  useStoreStatus: vi.fn(() => ({
    status: 'open',
    message: 'Đang mở cửa',
    details: 'Mở cửa từ 8:00 - 22:00',
    color: 'success',
    config: { openHour: 8, closeHour: 22 },
  })),
}));

describe('getStoreStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns open status when within open hours', () => {
    // 14:00 (2 PM) - Within 8-22
    const date = new Date(2024, 0, 1, 14, 0, 0);
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('open');
    expect(status.message).toBe('Đang mở cửa');
  });

  it('returns closing status when 30 mins before close', () => {
    // 21:45 (9:45 PM) - Close is 22:00
    const date = new Date(2024, 0, 1, 21, 45, 0);
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('closing');
    expect(status.message).toBe('Sắp đóng cửa');
  });

  it('returns closed status when after close hours', () => {
    // 23:00 (11 PM)
    const date = new Date(2024, 0, 1, 23, 0, 0);
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('closed');
    expect(status.message).toBe('Đã đóng cửa');
  });

  it('returns closed status when before open hours', () => {
    // 07:00 (7 AM) - Open is 08:00
    const date = new Date(2024, 0, 1, 7, 0, 0);
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('closed');
    expect(status.message).toBe('Đã đóng cửa');
  });
});

describe('OperatingHours Component', () => {
  it('renders correctly', () => {
    render(<OperatingHours />);
    expect(screen.getByText('Đang mở cửa')).toBeInTheDocument();
  });

  it('renders details when showDetails is true', () => {
    render(<OperatingHours showDetails={true} />);
    expect(screen.getByText(/8:00 - 22:00/)).toBeInTheDocument();
  });
});
