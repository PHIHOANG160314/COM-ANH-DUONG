import { CssBaseline } from '@mui/material';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/shared/theme/theme-context';
import { ToastProvider } from '@/shared/ui/toast-notification';
import { InstallPrompt } from '@/shared/ui/install-prompt';
import { AuthProvider } from './auth-provider';
import { router } from '../router/router';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const AppProvider = () => {
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <ThemeProvider>
          <CssBaseline />
          <ToastProvider>
            <AuthProvider>
              <RouterProvider router={router} />
              <InstallPrompt />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
};
