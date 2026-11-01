import { apiClient } from './client';
import { AppUsageItem } from '../types';

export const usageApi = {
  getScreenTime: async (childId: string): Promise<{ totalScreenTimeMinutes: number; date: string }> => {
    try {
      const res = await apiClient.get<any>(`/usage/screen-time/${childId}`);
      const duration = res.data?.totalScreenTimeMinutes ?? res.data?.totalDuration ?? 0;
      return {
        totalScreenTimeMinutes: Number(duration),
        date: res.data?.date || new Date().toISOString().split('T')[0],
      };
    } catch {
      return { totalScreenTimeMinutes: 0, date: new Date().toISOString().split('T')[0] };
    }
  },

  getAppUsage: async (childId: string): Promise<{ appUsage: AppUsageItem[]; isIOSUnavailable?: boolean }> => {
    try {
      const res = await apiClient.get<any>(`/usage/app-usage/${childId}`);
      const rawList: any[] = res.data?.appUsage || res.data?.usages || [];
      const appUsage: AppUsageItem[] = rawList.map((item) => ({
        appName: item.appName || item.packageName || 'Unknown App',
        packageName: item.packageName,
        durationMinutes: Number(item.durationMinutes ?? item.usageDuration ?? 0),
        sessionCount: item.sessionCount ?? 1,
      }));
      return {
        appUsage,
        isIOSUnavailable: res.data?.isIOSUnavailable || false,
      };
    } catch {
      return { appUsage: [], isIOSUnavailable: true };
    }
  },
};
