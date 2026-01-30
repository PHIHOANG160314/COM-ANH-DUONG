import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/shared/layouts';
import { LoginForm } from '@/features/auth/login-form';
import { RegisterForm } from '@/features/auth/register-form';
import { ProtectedRoute } from '@/shared/ui/protected-route';
import { CustomerHomePage } from '@/pages/customer/home-page';
import { CheckoutPage } from '@/pages/customer/checkout-page';
import { OrderSuccessPage } from '@/pages/customer/order-success-page';
import { KitchenDisplayPage } from '@/pages/kitchen/kitchen-display-page';
import { StaffMobilePosPage } from '@/pages/staff/staff-mobile-pos-page';
import { ShipperDeliveryPage } from '@/pages/shipper/shipper-delivery-page';
import { AdminLayout } from '@/shared/layouts';
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page';
import { AdminProductsPage } from '@/pages/admin/admin-products-page';
import { AdminMenuPage } from '@/pages/admin/admin-menu-page';
import { AdminOrdersPage } from '@/pages/admin/admin-orders-page';

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
        path: 'order-success',
        element: <OrderSuccessPage />,
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
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'products',
            element: <AdminProductsPage />,
          },
          {
            path: 'menu',
            element: <AdminMenuPage />,
          },
          {
            path: 'orders',
            element: <AdminOrdersPage />,
          },
          {
            path: 'settings',
            element: <div>Settings</div>,
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
            <StaffMobilePosPage />
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
            <KitchenDisplayPage />
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
            <ShipperDeliveryPage />
          </MainLayout>
        ),
      },
    ],
  },
  // Fallback
  {
    path: '*',
    element: (
      <MainLayout>
        <div>404 Not Found</div>
      </MainLayout>
    ),
  },
]);
