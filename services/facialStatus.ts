import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, removeStorageItems, STORAGE_KEYS } from '../constants/storage';
import type { User } from '../utils/permissionsManager';

export type FacialSyncState = 'UNKNOWN' | 'NOT_REGISTERED' | 'PENDING_PROCESSING' | 'READY' | 'FAILED' | 'BLOCKED';
export type PublicFaceStatus = 'NO_PHOTO' | 'PHOTO_ONLY' | 'FACE_PENDING_SYNC' | 'FACE_SYNCED' | 'FACE_ERROR';

export type FacialSyncStatus = {
  state: FacialSyncState;
  backendState?: PublicFaceStatus | null;
  updatedAt?: string | null;
  photoUri?: string | null;
  localPhotoUri?: string | null;
  localPhotoDataUri?: string | null;
  backendErrorMessage?: string | null;
};

const FACIAL_STATUS_KEY = STORAGE_KEYS.facialSyncStatus;

function normalizeFacialState(value: unknown): FacialSyncState {
  const state = String(value || '').toUpperCase();

  if (state === 'NO_PHOTO') return 'NOT_REGISTERED';
  if (state === 'PHOTO_ONLY') return 'NOT_REGISTERED';
  if (state === 'FACE_PENDING_SYNC') return 'PENDING_PROCESSING';
  if (state === 'FACE_SYNCED') return 'READY';
  if (state === 'FACE_ERROR') return 'FAILED';
  if (state === 'REGISTERED' || state === 'READY') return 'READY';
  if (state === 'PENDING' || state === 'PENDING_PROCESSING') return 'PENDING_PROCESSING';
  if (state === 'SKIPPED' || state === 'NOT_REGISTERED') return 'NOT_REGISTERED';
  if (state === 'FAILED') return 'FAILED';
  if (state === 'BLOCKED') return 'BLOCKED';
  return 'UNKNOWN';
}

function normalizePublicFaceStatus(value: unknown): PublicFaceStatus | null {
  const state = String(value || '').toUpperCase();
  if (state === 'NO_PHOTO' || state === 'PHOTO_ONLY' || state === 'FACE_PENDING_SYNC' || state === 'FACE_SYNCED' || state === 'FACE_ERROR') {
    return state as PublicFaceStatus;
  }
  return null;
}

export function getFacialStatusLabel(status?: FacialSyncStatus | null): string {
  if (!status) return 'Ainda nao iniciada';

  if (status.backendState === 'FACE_SYNCED') return 'Sincronizada';
  if (status.backendState === 'FACE_PENDING_SYNC') return 'Aguardando sincronizacao';
  if (status.backendState === 'FACE_ERROR') return 'Falhou';
  if (status.backendState === 'PHOTO_ONLY') return 'Somente foto';
  if (status.backendState === 'NO_PHOTO') return 'Sem foto';

  if (status.state === 'READY') return 'Sincronizada';
  if (status.state === 'PENDING_PROCESSING') return 'Pendente';
  if (status.state === 'FAILED') return 'Falhou';
  if (status.state === 'BLOCKED') return 'Bloqueada';
  if (status.state === 'NOT_REGISTERED') return status.photoUri ? 'Somente foto' : 'Sem foto';
  return 'Ainda nao iniciada';
}

export const facialStatusService = {
  async get(): Promise<FacialSyncStatus> {
    const raw = await getStorageItemWithLegacy(FACIAL_STATUS_KEY, LEGACY_STORAGE_KEYS.facialSyncStatus);
    if (!raw) {
      return { state: 'UNKNOWN', backendState: null, updatedAt: null, photoUri: null };
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        state: normalizeFacialState(parsed?.state),
        backendState: normalizePublicFaceStatus(parsed?.backendState),
        updatedAt: parsed?.updatedAt ?? null,
        photoUri: parsed?.photoUri ?? null,
        localPhotoUri: parsed?.localPhotoUri ?? null,
        localPhotoDataUri: parsed?.localPhotoDataUri ?? null,
        backendErrorMessage: parsed?.backendErrorMessage ?? null,
      };
    } catch {
      return { state: 'UNKNOWN', backendState: null, updatedAt: null, photoUri: null, localPhotoUri: null, localPhotoDataUri: null };
    }
  },

  async save(status: FacialSyncStatus) {
    await AsyncStorage.setItem(
      FACIAL_STATUS_KEY,
      JSON.stringify({
        ...status,
        state: normalizeFacialState(status.state),
        backendState: normalizePublicFaceStatus(status.backendState),
        backendErrorMessage: status.backendErrorMessage ?? null,
      })
    );
  },

  async clear() {
    await removeStorageItems([FACIAL_STATUS_KEY, ...LEGACY_STORAGE_KEYS.facialSyncStatus]);
  },

  async syncFromUserProfile(user?: Pick<User, 'faceStatus' | 'faceUpdatedAt' | 'photoUri' | 'faceErrorMessage'> | null) {
    if (!user) return;

    const backendState = normalizePublicFaceStatus(user.faceStatus);
    if (!backendState && !user.photoUri) return;

    const current = await this.get().catch((): FacialSyncStatus => ({
      state: 'UNKNOWN',
      backendState: null,
      updatedAt: null,
      photoUri: null,
      localPhotoUri: null,
      localPhotoDataUri: null,
      backendErrorMessage: null,
    }));

    await this.save({
      state: backendState ? normalizeFacialState(backendState) : user.photoUri ? 'NOT_REGISTERED' : current.state,
      backendState: backendState ?? (user.photoUri ? 'PHOTO_ONLY' : current.backendState ?? null),
      updatedAt: user.faceUpdatedAt ?? current.updatedAt ?? null,
      photoUri: user.photoUri ?? current.photoUri ?? null,
      localPhotoUri: current.localPhotoUri ?? null,
      localPhotoDataUri: current.localPhotoDataUri ?? null,
      backendErrorMessage: user.faceErrorMessage ?? (backendState === 'FACE_ERROR' ? current.backendErrorMessage ?? null : null),
    });
  },
};
