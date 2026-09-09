import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isParent, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner label="Verifying GuardianX Parent Portal session..." />
      </div>
    );
  }

  if (!isAuthenticated || !isParent) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
