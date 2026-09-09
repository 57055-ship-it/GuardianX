import { apiClient } from './client';
import { ChildProfile } from '../types';

export const childrenApi = {
  getChildren: async (): Promise<ChildProfile[]> => {
    const res = await apiClient.get<{ success: boolean; children: ChildProfile[] }>('/children');
    return res.data.children || [];
  },

  getChildById: async (id: string): Promise<ChildProfile> => {
    const res = await apiClient.get<{ success: boolean; child: ChildProfile }>(`/children/${id}`);
    return res.data.child;
  },

  createChild: async (name: string): Promise<ChildProfile> => {
    const res = await apiClient.post<{ success: boolean; child: ChildProfile }>('/children', { name });
    return res.data.child;
  },

  updateChild: async (id: string, name: string): Promise<ChildProfile> => {
    const res = await apiClient.put<{ success: boolean; child: ChildProfile }>(`/children/${id}`, { name });
    return res.data.child;
  },

  deleteChild: async (id: string): Promise<void> => {
    await apiClient.delete(`/children/${id}`);
  },
};
