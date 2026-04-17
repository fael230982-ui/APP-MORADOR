import api, { resolveApiUrl } from './api';
import type { User, UserRole } from '../utils/permissionsManager';

type AuthResponse = {
  token: string;
  user: User;
};

function normalizeRole(role: unknown): UserRole {
  const value = String(role || 'MORADOR').toUpperCase();
  if (['MASTER', 'ADMIN', 'OPERACIONAL', 'CENTRAL', 'SINDICO', 'PORTARIA', 'MORADOR'].includes(value)) {
    return value as UserRole;
  }
  return 'MORADOR';
}

function normalizeBackendFaceStatus(value: unknown): User['faceStatus'] {
  const state = String(value || '').toUpperCase();
  if (state === 'NO_PHOTO' || state === 'PHOTO_ONLY' || state === 'FACE_PENDING_SYNC' || state === 'FACE_SYNCED' || state === 'FACE_ERROR') {
    return state;
  }
  return null;
}

function normalizeScopeType(value: unknown): User['scopeType'] {
  const scope = String(value || '').toUpperCase();
  if (scope === 'GLOBAL' || scope === 'ASSIGNED' || scope === 'UNIT' || scope === 'RESIDENT' || scope === 'UNSCOPED') {
    return scope;
  }
  return value ? String(value) : null;
}

export function normalizeUser(raw: any): User {
  const source = raw?.user ?? raw;

  return {
    id: String(source?.id ?? ''),
    name: String(source?.name ?? source?.personName ?? 'Morador'),
    email: String(source?.email ?? ''),
    role: normalizeRole(source?.role),
    isActive: source?.isActive ?? source?.active ?? true,
    phone: source?.phone ?? null,
    cpf: source?.cpf ?? source?.document ?? null,
    apartment: source?.apartment ?? source?.unitName ?? source?.selectedUnitName ?? null,
    emergencyContact: source?.emergencyContact ?? null,
    photoUri: resolveApiUrl(source?.photoUri ?? source?.photoUrl ?? null),
    personId: source?.personId ?? null,
    personName: source?.personName ?? null,
    unitId: source?.unitId ?? null,
    unitName: source?.unitName ?? null,
    condominiumId: source?.condominiumId ?? null,
    condominiumIds: source?.condominiumIds ?? [],
    permissions: source?.permissions ?? [],
    effectiveAccess:
      source?.effectiveAccess && typeof source.effectiveAccess === 'object' ? source.effectiveAccess : {},
    scopeType: normalizeScopeType(source?.scopeType),
    selectedUnitId: source?.selectedUnitId ?? source?.unitId ?? null,
    selectedUnitName: source?.selectedUnitName ?? source?.unitName ?? null,
    requiresUnitSelection: source?.requiresUnitSelection ?? false,
    unitIds: source?.unitIds ?? (source?.unitId ? [source.unitId] : []),
    unitNames: source?.unitNames ?? (source?.unitName ? [source.unitName] : []),
    streetIds: source?.streetIds ?? [],
    hasFacialCredential: source?.hasFacialCredential ?? false,
    faceStatus: normalizeBackendFaceStatus(source?.faceStatus),
    faceUpdatedAt: source?.faceUpdatedAt ?? null,
    faceErrorMessage: source?.faceErrorMessage ?? null,
    profileSource: source?.profileSource ? String(source.profileSource) : null,
  };
}

function mockLogin(email: string): AuthResponse {
  return {
    user: {
      id: '1',
      name: 'Rafael Bezerra',
      email,
      role: 'MORADOR',
      isActive: true,
      selectedUnitId: null,
      selectedUnitName: null,
      requiresUnitSelection: true,
      unitIds: ['unit-501', 'unit-704'],
      unitNames: ['Apto 501', 'Apto 704'],
    },
    token: 'mock-token-resident-app',
  };
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const useMocks = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

    if (useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockLogin(email);
    }

    const response = await api.post('/api/v1/auth/login', { email, password });
    return {
      token: response.data.token ?? response.data.accessToken ?? response.data.access_token,
      user: normalizeUser(response.data.user),
    };
  },

  async me(options?: { skipSelectedUnit?: boolean }): Promise<User> {
    const response = await api.get('/api/v1/auth/me', {
      headers: options?.skipSelectedUnit ? { 'X-Skip-Selected-Unit': 'true' } : undefined,
    });
    return normalizeUser(response.data);
  },

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout');
  },
};
