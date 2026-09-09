import { apiClient } from './client';
import { LocationRecord } from '../types';

export const locationApi = {
  getLatestLocation: async (childId: string): Promise<LocationRecord | null> => {
    try {
      const res = await apiClient.get<{ success: boolean; location: LocationRecord }>(
        `/location/${childId}/latest`
      );
      return res.data.location;
    } catch {
      return null;
    }
  },

  getLocationHistory: async (childId: string, limit = 50): Promise<LocationRecord[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; history: LocationRecord[] }>(
        `/location/${childId}/history?limit=${limit}`
      );
      return res.data.history || [];
    } catch {
      return [];
    }
  },
};
