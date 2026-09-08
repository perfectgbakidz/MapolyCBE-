import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { Role } from '../../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
  role?: Role;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, role, redirectTo }) => {
  const { isLoading, candidateToken, adminToken, parentToken } = useAuth();
  const { navigate } = useRouter();

  if (isLoading) {
    return <LoadingSpinner label="Authenticating session tokens..." />;
  }

  const effectiveRole = requiredRole || role || 'candidate';

  if (effectiveRole === 'candidate') {
    if (!candidateToken) {
      navigate(redirectTo || '/login');
      return null;
    }
  } else if (effectiveRole === 'admin') {
    if (!adminToken) {
      navigate(redirectTo || '/admin/login');
      return null;
    }
  } else if (effectiveRole === 'parent') {
    if (!parentToken) {
      navigate(redirectTo || '/parent/login');
      return null;
    }
  }

  return <>{children}</>;
};
