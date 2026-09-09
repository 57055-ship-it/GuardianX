import { apiClient } from './client';
import { AuthResponse, User, Tenant } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    familyName?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  getProfile: async (): Promise<{ user: User; tenant: Tenant }> => {
    const res = await apiClient.get<{ success: boolean; user: User; tenant: Tenant }>('/auth/me');
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
