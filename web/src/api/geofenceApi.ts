import { apiClient } from './client';
import { Geofence } from '../types';

export const geofenceApi = {
  getGeofences: async (): Promise<Geofence[]> => {
    const res = await apiClient.get<{ success: boolean; geofences: Geofence[] }>('/geofences');
    return res.data.geofences || [];
  },

  createGeofence: async (data: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    type?: 'safe' | 'danger';
  }): Promise<Geofence> => {
    const res = await apiClient.post<{ success: boolean; geofence: Geofence }>('/geofences', data);
    return res.data.geofence;
  },

  updateGeofence: async (
    id: string,
    data: Partial<{
      name: string;
      latitude: number;
      longitude: number;
      radius: number;
      type: 'safe' | 'danger';
      isActive: boolean;
    }>
  ): Promise<Geofence> => {
    const res = await apiClient.put<{ success: boolean; geofence: Geofence }>(`/geofences/${id}`, data);
    return res.data.geofence;
  },

  deleteGeofence: async (id: string): Promise<void> => {
    await apiClient.delete(`/geofences/${id}`);
  },
};
