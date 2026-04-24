import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, removeStorageItems, STORAGE_KEYS } from '../constants/storage';

type ResidentProfileDraft = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  photoUri?: string | null;
};

const PROFILE_DRAFT_KEY = STORAGE_KEYS.residentProfileDraft;

function normalizeText(value?: string | null) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export const residentProfileDraftService = {
  async get(): Promise<ResidentProfileDraft> {
    const raw = await getStorageItemWithLegacy(PROFILE_DRAFT_KEY, LEGACY_STORAGE_KEYS.residentProfileDraft);
    if (!raw) return {};

    try {
      const parsed = JSON.parse(raw);
      return {
        name: normalizeText(parsed?.name),
        email: normalizeText(parsed?.email),
        phone: normalizeText(parsed?.phone),
        photoUri: normalizeText(parsed?.photoUri),
      };
    } catch {
      return {};
    }
  },

  async save(draft: ResidentProfileDraft) {
    const current = await this.get();
    const next = {
      name: normalizeText(draft.name) ?? current.name ?? null,
      email: normalizeText(draft.email) ?? current.email ?? null,
      phone: normalizeText(draft.phone) ?? current.phone ?? null,
      photoUri: normalizeText(draft.photoUri) ?? current.photoUri ?? null,
    };
    await AsyncStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(next));
    return next;
  },

  merge<T extends ResidentProfileDraft>(profile: T, draft: ResidentProfileDraft) {
    return {
      ...profile,
      name: normalizeText(profile.name) ?? normalizeText(draft.name) ?? null,
      email: normalizeText(profile.email) ?? normalizeText(draft.email) ?? null,
      phone: normalizeText(profile.phone) ?? normalizeText(draft.phone) ?? null,
      photoUri: normalizeText((profile as ResidentProfileDraft).photoUri) ?? normalizeText(draft.photoUri) ?? null,
    };
  },

  async clear() {
    await removeStorageItems([PROFILE_DRAFT_KEY, ...LEGACY_STORAGE_KEYS.residentProfileDraft]);
  },
};
