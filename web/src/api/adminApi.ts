import { apiClient } from './client';
import {
  DashboardStats,
  User,
  Tenant,
  ChildProfile,
  Plan,
  Subscription,
  AuditLog,
  SaaSSetting
} from '../types';

export const adminApi = {
  // Dashboard
  getDashboard: async () => {
    const res = await apiClient.get<{ success: boolean; stats: DashboardStats; charts: any }>('/admin/dashboard');
    return res.data;
  },

  // Parents
  getParents: async (params?: { page?: number; limit?: number; search?: string; plan?: string; status?: string }) => {
    const res = await apiClient.get<{
      success: boolean;
      parents: (User & { childrenCount: number; devicesCount: number; plan: string; subscriptionStatus: string; subscription?: Subscription })[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/admin/parents', { params });
    return res.data;
  },

  getParentById: async (id: string) => {
    const res = await apiClient.get<{
      success: boolean;
      parent: User;
      tenant: Tenant;
      subscription: Subscription | null;
      children: ChildProfile[];
      devices: any[];
      usageSummary: { childrenCount: number; devicesCount: number; geofenceCount: number };
    }>(`/admin/parents/${id}`);
    return res.data;
  },

  assignPlan: async (parentId: string, planSlug: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; tenant: Tenant; subscription: Subscription }>(
      `/admin/parents/${parentId}/plan`,
      { planSlug }
    );
    return res.data;
  },

  toggleSuspension: async (parentId: string, suspend: boolean, reason?: string) => {
    const res = await apiClient.put<{ success: boolean; message: string; parent: User }>(
      `/admin/parents/${parentId}/suspension`,
      { suspend, reason }
    );
    return res.data;
  },

  // Global Children & Families
  getChildren: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<{
      success: boolean;
      children: ChildProfile[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/admin/children', { params });
    return res.data;
  },

  getFamilies: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<{
      success: boolean;
      families: (Tenant & { childrenCount: number; devicesCount: number })[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/admin/families', { params });
    return res.data;
  },

  // Plans
  getPlans: async () => {
    const res = await apiClient.get<{ success: boolean; plans: Plan[] }>('/admin/plans');
    return res.data;
  },

  createPlan: async (planData: Partial<Plan>) => {
    const res = await apiClient.post<{ success: boolean; message: string; plan: Plan }>('/admin/plans', planData);
    return res.data;
  },

  updatePlan: async (id: string, planData: Partial<Plan>) => {
    const res = await apiClient.put<{ success: boolean; message: string; plan: Plan }>(`/admin/plans/${id}`, planData);
    return res.data;
  },

  // Subscriptions
  getSubscriptions: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get<{
      success: boolean;
      subscriptions: Subscription[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/admin/subscriptions', { params });
    return res.data;
  },

  // Usage
  getPlatformUsage: async () => {
    const res = await apiClient.get<{
      success: boolean;
      usage: {
        parentId: string;
        parentName: string;
        parentEmail: string;
        familyName: string;
        plan: string;
        children: { count: number; max: number };
        safeZones: { count: number; max: number };
        devices: { count: number; max: number };
      }[];
    }>('/admin/usage');
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: { page?: number; limit?: number; action?: string }) => {
    const res = await apiClient.get<{
      success: boolean;
      logs: AuditLog[];
      pagination: { total: number; page: number; limit: number; pages: number };
    }>('/admin/audit-logs', { params });
    return res.data;
  },

  // Settings
  getSettings: async () => {
    const res = await apiClient.get<{ success: boolean; settings: SaaSSetting[] }>('/admin/settings');
    return res.data;
  },

  updateSetting: async (key: string, value: any) => {
    const res = await apiClient.put<{ success: boolean; message: string; setting: SaaSSetting }>('/admin/settings', {
      key,
      value
    });
    return res.data;
  }
};
