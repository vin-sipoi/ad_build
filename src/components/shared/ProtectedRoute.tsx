// Role-based access control component
'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { LoadingScreen } from './Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  fallback 
}: ProtectedRouteProps) {
  const { userData, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && userData && !allowedRoles.includes(userData.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Insufficient Permissions</h2>
          <p className="text-muted-foreground">
            You don&apos;t have access to this resource
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
