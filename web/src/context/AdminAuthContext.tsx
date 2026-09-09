import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';

interface AdminAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('guardianx_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isAuthenticated = !!user && !!localStorage.getItem('guardianx_access_token') && isSuperAdmin;

  const checkSession = async () => {
    const token = localStorage.getItem('guardianx_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.getProfile();
      if (data.user.role !== 'super_admin' && data.user.role !== 'admin') {
        throw new Error('GuardianX Admin Control Plane requires a Super Admin account.');
      }
      setUser(data.user);
      localStorage.setItem('guardianx_admin_user', JSON.stringify(data.user));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.user.role !== 'super_admin' && res.user.role !== 'admin') {
        throw new Error('Access denied: GuardianX Admin Control Plane is restricted to Super Admin accounts.');
      }
      localStorage.setItem('guardianx_access_token', res.tokens.accessToken);
      localStorage.setItem('guardianx_refresh_token', res.tokens.refreshToken);
      localStorage.setItem('guardianx_admin_user', JSON.stringify(res.user));
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('guardianx_access_token');
      localStorage.removeItem('guardianx_refresh_token');
      localStorage.removeItem('guardianx_admin_user');
      setUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isSuperAdmin,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
