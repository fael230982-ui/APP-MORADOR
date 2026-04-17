import api from './api';
import { normalizeUser } from './authService';
import type { User } from '../utils/permissionsManager';
import { emitAppRefresh } from '../utils/refreshBus';

type ResidentProfileUpdatePayload = {
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
};

export const residentProfileService = {
  async getProfile(): Promise<User> {
    const response = await api.get('/api/v1/resident/profile');
    return normalizeUser(response.data);
  },

  async updateProfile(payload: ResidentProfileUpdatePayload): Promise<User> {
    const response = await api.put('/api/v1/resident/profile', payload);
    const user = normalizeUser(response.data);
    emitAppRefresh('mutation', { topics: ['profile', 'overview'], source: 'residentProfile.update' });
    return user;
  },
};
