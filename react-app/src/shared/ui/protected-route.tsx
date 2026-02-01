import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/use-auth';
import { AppLoading } from '@/shared/ui';
import type { Database } from '@/shared/types/database.types';
import { type ReactNode } from 'react';

type UserRole = Database['public']['Tables']['profiles']['Row']['role'];

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectPath?: string;
  children?: ReactNode;
}

export const ProtectedRoute = ({
  allowedRoles,
  redirectPath = '/login',
  children,
}: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoading fullScreen message="Checking permissions..." />;
  }

  // Not authenticated
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Role check (if roles are specified)
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If user has a role but it's not allowed, redirect to 403 or home
    // For now, redirect to home to avoid infinite loops if they are already on a protected page
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
