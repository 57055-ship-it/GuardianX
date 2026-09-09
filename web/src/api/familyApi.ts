import { apiClient } from './client';
import { FamilyDetailsResponse, Tenant } from '../types';

export const familyApi = {
  getFamilyDetails: async (): Promise<FamilyDetailsResponse> => {
    const res = await apiClient.get<FamilyDetailsResponse>('/families/me');
    return res.data;
  },

  updatePlan: async (plan: 'FREE' | 'FAMILY' | 'PREMIUM'): Promise<Tenant> => {
    const res = await apiClient.put<{ success: boolean; family: Tenant }>('/families/plan', { plan });
    return res.data.family;
  },
};
