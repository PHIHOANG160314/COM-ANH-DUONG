import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { MainLayout, AuthLayout } from '@/shared/layouts';
import { LoginForm } from '@/features/auth/login-form';
import { RegisterForm } from '@/features/auth/register-form';
import { ProtectedRoute } from '@/shared/ui/protected-route';
import { CustomerHomePage } from '@/pages/customer/home-page';
import { CheckoutPage } from '@/pages/customer/checkout-page';
import { OrderSuccessPage } from '@/pages/customer/order-success-page';
import { PaymentResultPage } from '@/pages/customer/payment-result-page';
import { MenuShowcase } from '@/features/menu/components/menu-showcase';
import { NotFoundPage } from '@/pages/not-found-page';
import { OfflinePage } from '@/pages/offline';
import { LazyPage } from '@/shared/ui/lazy-page';

// Lazy load heavy pages for code splitting
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/profile-page').then((m) => ({ default: m.ProfilePage }))
);
const KitchenDisplayPage = lazy(() =>
  import('@/pages/kitchen/kitchen-display-page').then((m) => ({ default: m.KitchenDisplayPage }))
);
const StaffMobilePosPage = lazy(() =>
  import('@/pages/staff/staff-mobile-pos-page').then((m) => ({ default: m.StaffMobilePosPage }))
);
const ShipperDeliveryPage = lazy(() =>
  import('@/pages/shipper/shipper-delivery-page').then((m) => ({ default: m.ShipperDeliveryPage }))
);
const AdminLayout = lazy(() =>
  import('@/shared/layouts').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/admin-dashboard-page').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminAnalyticsPage = lazy(() =>
  import('@/features/analytics/pages/admin-analytics-page').then((m) => ({
    default: m.AdminAnalyticsPage,
  }))
);
const AdminProductsPage = lazy(() =>
  import('@/pages/admin/admin-products-page').then((m) => ({ default: m.AdminProductsPage }))
);
const AdminMenuPage = lazy(() =>
  import('@/pages/admin/admin-menu-page').then((m) => ({ default: m.AdminMenuPage }))
);
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/admin-orders-page').then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/admin-settings-page').then((m) => ({ default: m.AdminSettingsPage }))
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <CustomerHomePage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'menu',
        element: <MenuShowcase />,
      },
      {
        path: 'checkout/result',
        element: <PaymentResultPage />,
      },
      {
        path: 'order-success',
        element: <OrderSuccessPage />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <LazyPage>
              <ProfilePage />
            </LazyPage>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginForm />,
      },
      {
        path: 'register',
        element: <RegisterForm />,
      },
    ],
  },
  // Protected Routes
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        path: 'admin',
        element: (
          <LazyPage>
            <AdminLayout />
          </LazyPage>
        ),
        children: [
          {
            index: true,
            element: (
              <LazyPage>
                <AdminDashboardPage />
              </LazyPage>
            ),
          },
          {
            path: 'analytics',
            element: (
              <LazyPage>
                <AdminAnalyticsPage />
              </LazyPage>
            ),
          },
          {
            path: 'products',
            element: (
              <LazyPage>
                <AdminProductsPage />
              </LazyPage>
            ),
          },
          {
            path: 'menu',
            element: (
              <LazyPage>
                <AdminMenuPage />
              </LazyPage>
            ),
          },
          {
            path: 'orders',
            element: (
              <LazyPage>
                <AdminOrdersPage />
              </LazyPage>
            ),
          },
          {
            path: 'settings',
            element: (
              <LazyPage>
                <AdminSettingsPage />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['staff', 'admin']} />,
    children: [
      {
        path: 'pos',
        element: (
          <MainLayout>
            <LazyPage>
              <StaffMobilePosPage />
            </LazyPage>
          </MainLayout>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['staff', 'admin']} />, // Ideally role 'kitchen' if available, but staff works
    children: [
      {
        path: 'kitchen',
        element: (
          <MainLayout>
            <LazyPage>
              <KitchenDisplayPage />
            </LazyPage>
          </MainLayout>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['shipper', 'admin']} />,
    children: [
      {
        path: 'delivery',
        element: (
          <MainLayout>
            <LazyPage>
              <ShipperDeliveryPage />
            </LazyPage>
          </MainLayout>
        ),
      },
    ],
  },
  // Offline page
  {
    path: 'offline',
    element: <OfflinePage />,
  },
  // Fallback
  {
    path: '*',
    element: (
      <MainLayout>
        <NotFoundPage />
      </MainLayout>
    ),
  },
]);
