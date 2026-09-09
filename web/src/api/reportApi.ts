import { apiClient } from './client';
import { DailyReport } from '../types';

export const reportApi = {
  getDailyReport: async (childId?: string): Promise<DailyReport | null> => {
    try {
      const url = childId ? `/reports/daily?childId=${childId}` : '/reports/daily';
      const res = await apiClient.get<{ success: boolean; report: DailyReport }>(url);
      return res.data.report;
    } catch {
      return null;
    }
  },

  getWeeklyReport: async (childId?: string): Promise<DailyReport | null> => {
    try {
      const url = childId ? `/reports/weekly?childId=${childId}` : '/reports/weekly';
      const res = await apiClient.get<{ success: boolean; report: DailyReport }>(url);
      return res.data.report;
    } catch {
      return null;
    }
  },
};
