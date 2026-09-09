import { apiClient } from './client';
import { AppUsageRecord, AppUsageItem } from '../types';

export const usageApi = {
  getScreenTime: async (childId: string): Promise<{ totalScreenTimeMinutes: number; date: string }> => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        totalScreenTimeMinutes: number;
        date: string;
      }>(`/usage/screen-time/${childId}`);
      return {
        totalScreenTimeMinutes: res.data.totalScreenTimeMinutes || 0,
        date: res.data.date || new Date().toISOString().split('T')[0],
      };
    } catch {
      return { totalScreenTimeMinutes: 0, date: new Date().toISOString().split('T')[0] };
    }
  },

  getAppUsage: async (childId: string): Promise<{ appUsage: AppUsageItem[]; isIOSUnavailable?: boolean }> => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        appUsage: AppUsageItem[];
        isIOSUnavailable?: boolean;
      }>(`/usage/app-usage/${childId}`);
      return {
        appUsage: res.data.appUsage || [],
        isIOSUnavailable: res.data.isIOSUnavailable || false,
      };
    } catch {
      return { appUsage: [], isIOSUnavailable: true };
    }
  },
};
