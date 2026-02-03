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
    details: 'Mở cửa từ 6:00 - 21:00',
    color: 'success',
    config: { openHour: 6, closeHour: 21 },
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
    // 14:00 (2 PM) - Within 6-21 (before closing soon at 20:30)
    // Use ISO with +07:00 to ensure consistent timezone interpretation
    const date = new Date('2024-01-01T14:00:00+07:00');
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('open');
    expect(status.message).toBe('Đang mở cửa');
  });

  it('returns closing status when 30 mins before close', () => {
    // 20:45 (8:45 PM) - Close is 21:00, closingSoon starts at 20:30
    const date = new Date('2024-01-01T20:45:00+07:00');
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('closing');
    expect(status.message).toBe('Sắp đóng cửa');
  });

  it('returns closed status when after close hours', () => {
    // 22:00 (10 PM) - After 21:00 close
    const date = new Date('2024-01-01T22:00:00+07:00');
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('closed');
    expect(status.message).toBe('Đã đóng cửa');
  });

  it('returns closed status when before open hours', () => {
    // 05:00 (5 AM) - Open is 06:00
    const date = new Date('2024-01-01T05:00:00+07:00');
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
    expect(screen.getByText(/6:00 - 21:00/)).toBeInTheDocument();
  });
});
