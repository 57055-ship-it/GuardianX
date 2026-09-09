import { apiClient } from './client';
import { SafetyInsights } from '../types';

export const analyticsApi = {
  getSafetyInsights: async (childId?: string): Promise<SafetyInsights | null> => {
    try {
      const url = childId ? `/analytics/insights?childId=${childId}` : '/analytics/insights';
      const res = await apiClient.get<{ success: boolean; insights: SafetyInsights }>(url);
      return res.data.insights;
    } catch {
      return null;
    }
  },
};
