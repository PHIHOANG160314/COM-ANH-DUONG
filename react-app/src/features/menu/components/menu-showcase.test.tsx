import { render, screen } from '@testing-library/react';
import { MenuShowcase } from './menu-showcase';
import { useDailyMenu } from '../api/use-menu';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock the hook
vi.mock('../api/use-menu', () => ({
  useDailyMenu: vi.fn(),
}));

const mockUseDailyMenu = useDailyMenu as Mock;

describe('MenuShowcase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main sections', () => {
    mockUseDailyMenu.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<MenuShowcase />);

    // Hero
    expect(screen.getByRole('heading', { name: /Cơm Ánh Dương/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hương Vị Quê Hương/i })).toBeInTheDocument();

    // Categories
    expect(screen.getByText('Cơm')).toBeInTheDocument();
    expect(screen.getByText('Món Chính')).toBeInTheDocument();
    expect(screen.getByText('Đồ Uống')).toBeInTheDocument();
    expect(screen.getByText('Tráng Miệng')).toBeInTheDocument();

    // Daily Specials
    expect(screen.getByText(/Ưu Đãi Hôm Nay/i)).toBeInTheDocument();

    // Footer
    expect(screen.getByText(/Sa Đéc, Đồng Tháp/i)).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    mockUseDailyMenu.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<MenuShowcase />);
    expect(screen.getByText(/Đang tải món ăn/i)).toBeInTheDocument();
  });

  it('renders featured products when data is loaded', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product 1',
        price: 50000,
        image_url: 'test1.jpg',
        description: 'Description 1',
      },
      {
        id: '2',
        name: 'Test Product 2',
        price: 25000,
        image_url: 'test2.jpg',
        description: 'Description 2',
      },
    ];

    mockUseDailyMenu.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    });

    render(<MenuShowcase />);

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('50.000đ')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();

    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('25.000đ')).toBeInTheDocument();
  });
});
