import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { OperatingHours, getStoreStatus } from './operating-hours';
import '@testing-library/jest-dom';

describe('getStoreStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns open status when within open hours', () => {
    // 14:00 (2 PM)
    const date = new Date(2024, 0, 1, 14, 0, 0);
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('open');
    expect(status.message).toBe('Đang mở cửa');
  });

  it('returns closing status when 30 mins before close', () => {
    // 21:45 (9:45 PM) - Assuming close is 22:00
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
    // 08:00 (8 AM) - Assuming open is 10:00
    const date = new Date(2024, 0, 1, 8, 0, 0);
    vi.setSystemTime(date);
    const status = getStoreStatus();
    expect(status.status).toBe('closed');
    expect(status.message).toBe('Đã đóng cửa');
  });
});

describe('OperatingHours Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly', () => {
     // Set time to open
    const date = new Date(2024, 0, 1, 14, 0, 0);
    vi.setSystemTime(date);

    render(<OperatingHours />);
    expect(screen.getByText('Đang mở cửa')).toBeInTheDocument();
  });

  it('renders details when showDetails is true', () => {
     // Set time to open
    const date = new Date(2024, 0, 1, 14, 0, 0);
    vi.setSystemTime(date);

    render(<OperatingHours showDetails={true} />);
    expect(screen.getByText(/10:00 - 22:00/)).toBeInTheDocument();
  });
});
