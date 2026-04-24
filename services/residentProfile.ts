import api from './api';
import { normalizeUser } from './authService';
import { getPersonById } from './persons';
import { residentProfileDraftService } from './residentProfileDraft';
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
    const normalized = normalizeUser(response.data);
    const needsOperationalEnrichment =
      !!normalized.personId && (!normalized.phone || !normalized.photoUri || !normalized.faceStatus);
    const enriched =
      needsOperationalEnrichment
        ? await getPersonById(String(normalized.personId))
            .then((person) => ({
              ...normalized,
              phone: normalized.phone ?? person?.phone ?? null,
              photoUri: normalized.photoUri ?? person?.photoUrl ?? null,
              faceStatus:
                normalized.faceStatus ??
                person?.faceStatus ??
                (person?.status === 'ACTIVE' ? 'NO_PHOTO' : normalized.faceStatus),
            }))
            .catch(() => normalized)
        : normalized;
    const draft = await residentProfileDraftService.get().catch(() => ({}));
    return residentProfileDraftService.merge(enriched, draft);
  },

  async updateProfile(payload: ResidentProfileUpdatePayload): Promise<User> {
    const response = await api.put('/api/v1/resident/profile', payload);
    const normalized = normalizeUser(response.data);
    const savedDraft = await residentProfileDraftService.save({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      photoUri: payload.photoUrl,
    }).catch(() => ({}));
    const user = residentProfileDraftService.merge(
      {
        ...normalized,
        photoUri: normalized.photoUri ?? payload.photoUrl ?? null,
      },
      savedDraft
    );
    emitAppRefresh('mutation', { topics: ['profile', 'overview'], source: 'residentProfile.update' });
    return user;
  },
};
