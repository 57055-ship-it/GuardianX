import { apiClient } from './client';
import { Alert } from '../types';

export const alertApi = {
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; alerts: Alert[] }>('/alerts');
      return res.data.alerts || [];
    } catch {
      return [];
    }
  },

  markAsRead: async (alertId: string): Promise<void> => {
    await apiClient.put(`/alerts/${alertId}/read`);
  },
};
