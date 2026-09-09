import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isParent: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; familyName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('guardianx_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [tenant, setTenant] = useState<Tenant | null>(() => {
    const savedTenant = localStorage.getItem('guardianx_tenant');
    return savedTenant ? JSON.parse(savedTenant) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isParent = user?.role === 'parent';
  const isAuthenticated = !!user && !!localStorage.getItem('guardianx_access_token');

  const checkSession = async () => {
    const token = localStorage.getItem('guardianx_access_token');
    if (!token) {
      setUser(null);
      setTenant(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.getProfile();
      if (data.user.role !== 'parent') {
        // Reject non-parent roles on Web Parent Portal
        throw new Error('GuardianX Web Portal requires a Parent account.');
      }
      setUser(data.user);
      setTenant(data.tenant);
      localStorage.setItem('guardianx_user', JSON.stringify(data.user));
      if (data.tenant) {
        localStorage.setItem('guardianx_tenant', JSON.stringify(data.tenant));
      }
    } catch {
      localStorage.removeItem('guardianx_access_token');
      localStorage.removeItem('guardianx_refresh_token');
      localStorage.removeItem('guardianx_user');
      localStorage.removeItem('guardianx_tenant');
      setUser(null);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    const handleUnauthorized = () => {
      setUser(null);
      setTenant(null);
    };

    window.addEventListener('guardianx_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('guardianx_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.user.role !== 'parent') {
        throw new Error('Access denied: GuardianX Web Portal is for Parent accounts only.');
      }
      localStorage.setItem('guardianx_access_token', res.tokens.accessToken);
      localStorage.setItem('guardianx_refresh_token', res.tokens.refreshToken);
      localStorage.setItem('guardianx_user', JSON.stringify(res.user));
      if (res.tenant) {
        localStorage.setItem('guardianx_tenant', JSON.stringify(res.tenant));
      }
      setUser(res.user);
      setTenant(res.tenant || null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; familyName?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.user.role !== 'parent') {
        throw new Error('Public registration creates Parent accounts only.');
      }
      localStorage.setItem('guardianx_access_token', res.tokens.accessToken);
      localStorage.setItem('guardianx_refresh_token', res.tokens.refreshToken);
      localStorage.setItem('guardianx_user', JSON.stringify(res.user));
      if (res.tenant) {
        localStorage.setItem('guardianx_tenant', JSON.stringify(res.tenant));
      }
      setUser(res.user);
      setTenant(res.tenant || null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('guardianx_access_token');
      localStorage.removeItem('guardianx_refresh_token');
      localStorage.removeItem('guardianx_user');
      localStorage.removeItem('guardianx_tenant');
      setUser(null);
      setTenant(null);
    }
  };

  const refreshProfile = async () => {
    await checkSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated,
        isLoading,
        isParent,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
