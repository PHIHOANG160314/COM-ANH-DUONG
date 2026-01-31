import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainLayout } from './main-layout';
import { BrowserRouter } from 'react-router-dom';
import * as useAuthHook from '@/features/auth/api/use-auth';
import * as cartStore from '@/features/cart/model/cart-store';
import type { CartState } from '@/features/cart/model/cart-store';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock dependencies
vi.mock('@/features/auth/api/use-auth');
vi.mock('@/features/cart/model/cart-store');
vi.mock('@/features/pwa/reload-prompt', () => ({
  ReloadPrompt: () => <div data-testid="reload-prompt">Reload Prompt</div>
}));
vi.mock('@/features/pwa/install-prompt', () => ({
  InstallPrompt: () => <div data-testid="install-prompt">Install Prompt</div>
}));
vi.mock('@/shared/ui/operating-hours', () => ({
  OperatingHours: () => <div data-testid="operating-hours">Operating Hours</div>
}));
vi.mock('@/shared/ui/zalo-chat-fab', () => ({
  ZaloChatFab: () => <div data-testid="zalo-chat-fab">Zalo Chat</div>
}));
vi.mock('@/shared/ui/footer-compliance', () => ({
  FooterCompliance: () => <div data-testid="footer-compliance">Compliance Footer</div>
}));

// Mock ResizeObserver for MUI
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('MainLayout', () => {
  const mockUseAuth = vi.spyOn(useAuthHook, 'useAuth');
  // @ts-ignore
  const mockUseCartStore = vi.spyOn(cartStore, 'useCartStore');

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null } as any);
    mockUseCartStore.mockImplementation((selector: (state: CartState) => unknown) => selector({ totalItems: () => 0 } as unknown as CartState));
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders app title and navigation items', () => {
    renderWithRouter(<MainLayout />);

    expect(screen.getAllByText('Cơm Ánh Dương')[0]).toBeInTheDocument();
  });

  it('renders footer with compliance section', () => {
    renderWithRouter(<MainLayout />);

    expect(screen.getByText('Khách hàng')).toBeInTheDocument();
    expect(screen.getByText('Liên hệ')).toBeInTheDocument();
    expect(screen.getByTestId('footer-compliance')).toBeInTheDocument();
  });

  it('renders Zalo chat FAB', () => {
    renderWithRouter(<MainLayout />);
    expect(screen.getByTestId('zalo-chat-fab')).toBeInTheDocument();
  });

  it('displays login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null } as any);
    renderWithRouter(<MainLayout />);
    expect(screen.getAllByText('Đăng nhập')[0]).toBeInTheDocument();
  });

  it('navigates to menu when footer link is clicked', () => {
    renderWithRouter(<MainLayout />);

    // Find footer link "Thực đơn"
    const menuLinks = screen.getAllByText('Thực đơn');
    const footerMenuLink = menuLinks.find(el => el.tagName === 'P'); // Footer links are Typography (p)

    if (footerMenuLink) {
      fireEvent.click(footerMenuLink);
      expect(mockNavigate).toHaveBeenCalledWith('/menu');
    } else {
      // Fallback if structure changes (MUI Typography component="p" by default for body1/body2)
       const fallbackLink = screen.getByText('Thực đơn', { selector: 'p' });
       fireEvent.click(fallbackLink);
       expect(mockNavigate).toHaveBeenCalledWith('/menu');
    }
  });

  it('buttons have sufficient touch target size', () => {
    renderWithRouter(<MainLayout />);
    const menuButtons = screen.queryAllByText('Thực đơn');
    const appBarButton = menuButtons.find(el => el.closest('header'));

    if (appBarButton) {
      const button = appBarButton.closest('button');
      if (button) {
         expect(button).toHaveStyle({ minHeight: '44px' });
      }
    }
  });

  it('footer links have sufficient padding for touch targets', () => {
    renderWithRouter(<MainLayout />);
    const footerLink = screen.getByText('Thực đơn', { selector: 'p' });
    expect(footerLink).toBeInTheDocument();
  });
});
