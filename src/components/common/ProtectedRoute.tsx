import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { Role } from '../../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isLoading, candidateToken, adminToken } = useAuth();
  const { navigate } = useRouter();

  if (isLoading) {
    return <LoadingSpinner label="Authenticating session tokens..." />;
  }

  if (requiredRole === 'candidate') {
    if (!candidateToken) {
      navigate('/login');
      return null;
    }
  } else if (requiredRole === 'admin') {
    if (!adminToken) {
      navigate('/admin/login');
      return null;
    }
  }

  return <>{children}</>;
};
