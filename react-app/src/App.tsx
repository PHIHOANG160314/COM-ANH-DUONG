import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import './App.css';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/home-landing-page'));
const CustomerPage = lazy(() => import('./pages/customer-ordering-page'));
const KitchenPage = lazy(() => import('./pages/kitchen-display-system-page'));
const ShipperPage = lazy(() => import('./pages/shipper-delivery-page'));
const StaffMobilePage = lazy(() => import('./pages/staff-mobile-pos-page'));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

// Define routes using React Router v7 data router
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/customer',
    element: <CustomerPage />,
  },
  {
    path: '/kitchen',
    element: <KitchenPage />,
  },
  {
    path: '/shipper',
    element: <ShipperPage />,
  },
  {
    path: '/staff-mobile',
    element: <StaffMobilePage />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="loading">Đang tải...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
