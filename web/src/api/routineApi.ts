import { apiClient } from './client';
import { FamilyRoutine, TodayHadith } from '../types';

export const routineApi = {
  getRoutines: async (): Promise<FamilyRoutine[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; routines: FamilyRoutine[] }>('/routines');
      return res.data.routines || [];
    } catch {
      return [];
    }
  },

  createRoutine: async (data: {
    title: string;
    description?: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'bedtime';
  }): Promise<FamilyRoutine> => {
    const res = await apiClient.post<{ success: boolean; routine: FamilyRoutine }>('/routines', data);
    return res.data.routine;
  },

  getTodayHadith: async (): Promise<TodayHadith | null> => {
    try {
      const res = await apiClient.get<{ success: boolean; hadith: TodayHadith }>('/routines/hadith/today');
      return res.data.hadith;
    } catch {
      return null;
    }
  },
};
