import { apiClient } from './client';
import { SOSEvent } from '../types';

export const sosApi = {
  getSOSEvents: async (childId: string): Promise<SOSEvent[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; sosEvents: SOSEvent[] }>(`/sos/${childId}`);
      return res.data.sosEvents || [];
    } catch {
      return [];
    }
  },

  resolveSOSEvent: async (sosId: string): Promise<void> => {
    await apiClient.put(`/sos/${sosId}/resolve`);
  },
};
