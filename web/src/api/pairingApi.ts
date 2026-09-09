import { apiClient } from './client';
import { PairingCode } from '../types';

export const pairingApi = {
  createPairingCode: async (childId: string): Promise<PairingCode> => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      pairingCode: PairingCode;
    }>('/pairing/create', { childId });
    return res.data.pairingCode;
  },
};
