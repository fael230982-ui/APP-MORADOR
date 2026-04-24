import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { CURRENT_TERMS_VERSION, type LegalAcceptanceRecord } from '../constants/legal';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, removeStorageItems, STORAGE_KEYS } from '../constants/storage';
import { clearSensitiveResidentSessionData } from '../services/localDataGovernance';
import type { ResidentAppConfig } from '../services/residentAppConfig';
import { emitAppRefresh } from '../utils/refreshBus';
import { User } from '../utils/permissionsManager';

interface AuthStore {
  user: User | null;
  token: string | null;
  currentTermsVersion: string;
  hasAcceptedTerms: boolean;
  acceptedTermsVersion: string | null;
  acceptedTermsAt: string | null;
  selectedUnitId: string | null;
  selectedUnitName: string | null;
  preferredUnitId: string | null;
  residentAppConfig: ResidentAppConfig | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  setResidentAppConfig: (value: ResidentAppConfig | null) => void;
  selectUnit: (unitId: string, unitName?: string | null) => void;
  setPreferredUnit: (unitId: string | null) => void;
  clearSelectedUnit: () => void;
  logout: () => void;
  acceptTerms: () => void;
  setCurrentTermsVersion: (value: string | null | undefined) => void;
  setTermsAcceptance: (value: LegalAcceptanceRecord) => void;
  refreshTermsAcceptance: () => Promise<void>;
  loadStorage: () => Promise<void>;
}

const USER_KEY = STORAGE_KEYS.authUser;
const TOKEN_KEY = STORAGE_KEYS.authToken;
const TERMS_KEY = STORAGE_KEYS.authTerms;
const SELECTED_UNIT_ID_KEY = STORAGE_KEYS.authSelectedUnitId;
const SELECTED_UNIT_NAME_KEY = STORAGE_KEYS.authSelectedUnitName;
const PREFERRED_UNIT_ID_KEY = 'auth.preferredUnitId';

function resolveSelectedUnit(
  user: User,
  storedUnitId?: string | null,
  preferredUnitId?: string | null,
  storedUnitName?: string | null,
  preferStoredUnit = true
) {
  const unitIds = user.unitIds ?? [];
  const unitNames = user.unitNames ?? [];
  const candidateId = preferStoredUnit
    ? storedUnitId ?? preferredUnitId ?? user.selectedUnitId ?? user.unitId ?? null
    : user.selectedUnitId ?? preferredUnitId ?? user.unitId ?? storedUnitId ?? null;

  if (unitIds.length > 0) {
    const candidateIndex = candidateId ? unitIds.indexOf(candidateId) : -1;

    if (candidateIndex >= 0) {
      return {
        selectedUnitId: candidateId,
        selectedUnitName: preferStoredUnit
          ? unitNames[candidateIndex] ?? storedUnitName ?? user.selectedUnitName ?? user.unitName ?? null
          : unitNames[candidateIndex] ?? user.selectedUnitName ?? user.unitName ?? storedUnitName ?? null,
        requiresUnitSelection: false,
      };
    }

    if (unitIds.length === 1 && !user.requiresUnitSelection) {
      return {
        selectedUnitId: unitIds[0],
        selectedUnitName: unitNames[0] ?? user.unitName ?? null,
        requiresUnitSelection: false,
      };
    }

    return {
      selectedUnitId: null,
      selectedUnitName: null,
      requiresUnitSelection: true,
    };
  }

  return {
    selectedUnitId: candidateId,
    selectedUnitName: preferStoredUnit
      ? storedUnitName ?? user.selectedUnitName ?? user.unitName ?? null
      : user.selectedUnitName ?? user.unitName ?? storedUnitName ?? null,
    requiresUnitSelection: !!user.requiresUnitSelection && !candidateId,
  };
}

function parseTerms(raw: string | null) {
  if (!raw || raw === 'true') {
    return {
      hasAcceptedTerms: false,
      acceptedTermsVersion: null,
      acceptedTermsAt: null,
    };
  }

  try {
    const parsed = JSON.parse(raw) as {
      accepted?: boolean;
      version?: string | null;
      acceptedAt?: string | null;
    };

    return {
      hasAcceptedTerms: parsed.accepted === true && parsed.version === CURRENT_TERMS_VERSION,
      acceptedTermsVersion: parsed.version ?? null,
      acceptedTermsAt: parsed.acceptedAt ?? null,
    };
  } catch {
    return {
      hasAcceptedTerms: false,
      acceptedTermsVersion: null,
      acceptedTermsAt: null,
    };
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  currentTermsVersion: CURRENT_TERMS_VERSION,
  hasAcceptedTerms: false,
  acceptedTermsVersion: null,
  acceptedTermsAt: null,
  selectedUnitId: null,
  selectedUnitName: null,
  preferredUnitId: null,
  residentAppConfig: null,

  setAuth: (user, token) => {
    const preferredUnitId = useAuthStore.getState().preferredUnitId;
    const resolved = resolveSelectedUnit(user, null, preferredUnitId);
    const nextUser = {
      ...user,
      selectedUnitId: resolved.selectedUnitId,
      selectedUnitName: resolved.selectedUnitName,
      requiresUnitSelection: resolved.requiresUnitSelection,
    };

    set({
      user: nextUser,
      token,
      selectedUnitId: resolved.selectedUnitId,
      selectedUnitName: resolved.selectedUnitName,
    });

    AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    AsyncStorage.setItem(TOKEN_KEY, token);
    if (resolved.selectedUnitId) {
      AsyncStorage.setItem(SELECTED_UNIT_ID_KEY, resolved.selectedUnitId);
    } else {
      AsyncStorage.removeItem(SELECTED_UNIT_ID_KEY);
    }
    if (resolved.selectedUnitName) {
      AsyncStorage.setItem(SELECTED_UNIT_NAME_KEY, resolved.selectedUnitName);
    } else {
      AsyncStorage.removeItem(SELECTED_UNIT_NAME_KEY);
    }
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;

      const mergedUser = { ...state.user, ...updates };
      const resolved = resolveSelectedUnit(
        mergedUser,
        state.selectedUnitId,
        state.preferredUnitId,
        state.selectedUnitName,
        false
      );
      const nextUser = {
        ...mergedUser,
        selectedUnitId: resolved.selectedUnitId,
        selectedUnitName: resolved.selectedUnitName,
        requiresUnitSelection: resolved.requiresUnitSelection,
      };

      AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      if (resolved.selectedUnitId) {
        AsyncStorage.setItem(SELECTED_UNIT_ID_KEY, resolved.selectedUnitId);
      } else {
        AsyncStorage.removeItem(SELECTED_UNIT_ID_KEY);
      }
      if (resolved.selectedUnitName) {
        AsyncStorage.setItem(SELECTED_UNIT_NAME_KEY, resolved.selectedUnitName);
      } else {
        AsyncStorage.removeItem(SELECTED_UNIT_NAME_KEY);
      }

      return {
        ...state,
        user: nextUser,
        selectedUnitId: resolved.selectedUnitId,
        selectedUnitName: resolved.selectedUnitName,
        preferredUnitId: state.preferredUnitId,
      };
    });

    emitAppRefresh('mutation', {
      topics: ['unit', 'overview', 'profile', 'messages', 'notifications', 'deliveries', 'alerts', 'visits', 'vehicles', 'cameras'],
      source: 'auth.updateUser',
    });
  },

  setResidentAppConfig: (value) => {
    set({ residentAppConfig: value });

    emitAppRefresh('mutation', {
      topics: ['unit', 'overview', 'profile'],
      source: 'auth.setResidentAppConfig',
    });
  },

  selectUnit: (unitId, unitName) => {
    const currentUser = useAuthStore.getState().user;
    const allowedUnitIds = currentUser?.unitIds ?? [];
    if (allowedUnitIds.length > 0 && !allowedUnitIds.includes(unitId)) {
      return;
    }

    set((state) => {
      const nextUser = state.user
        ? {
            ...state.user,
            selectedUnitId: unitId,
            selectedUnitName: unitName ?? null,
            requiresUnitSelection: false,
          }
        : state.user;

      if (nextUser) {
        AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      }

      return {
        user: nextUser,
        selectedUnitId: unitId,
        selectedUnitName: unitName ?? null,
      };
    });

    AsyncStorage.setItem(SELECTED_UNIT_ID_KEY, unitId);
    if (unitName) {
      AsyncStorage.setItem(SELECTED_UNIT_NAME_KEY, unitName);
    } else {
      AsyncStorage.removeItem(SELECTED_UNIT_NAME_KEY);
    }

    emitAppRefresh('mutation', {
      topics: ['unit', 'overview', 'profile', 'messages', 'notifications', 'deliveries', 'alerts', 'visits', 'vehicles', 'cameras'],
      source: 'auth.selectUnit',
    });
  },

  setPreferredUnit: (unitId) => {
    set({ preferredUnitId: unitId });

    if (unitId) {
      AsyncStorage.setItem(PREFERRED_UNIT_ID_KEY, unitId);
    } else {
      AsyncStorage.removeItem(PREFERRED_UNIT_ID_KEY);
    }
  },

  clearSelectedUnit: () => {
    set((state) => {
      const nextUser = state.user
        ? {
            ...state.user,
            selectedUnitId: null,
            selectedUnitName: null,
            requiresUnitSelection: true,
          }
        : null;

      if (nextUser) {
        AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      }

      return {
        user: nextUser,
        selectedUnitId: null,
        selectedUnitName: null,
      };
    });

    AsyncStorage.removeItem(SELECTED_UNIT_ID_KEY);
    AsyncStorage.removeItem(SELECTED_UNIT_NAME_KEY);
    emitAppRefresh('mutation', {
      topics: ['unit', 'overview', 'profile', 'messages', 'notifications', 'deliveries', 'alerts', 'visits', 'vehicles', 'cameras'],
      source: 'auth.clearSelectedUnit',
    });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      selectedUnitId: null,
      selectedUnitName: null,
      preferredUnitId: null,
      residentAppConfig: null,
      currentTermsVersion: CURRENT_TERMS_VERSION,
      hasAcceptedTerms: false,
      acceptedTermsVersion: null,
      acceptedTermsAt: null,
    });

    removeStorageItems([
      USER_KEY,
      ...LEGACY_STORAGE_KEYS.authUser,
      TOKEN_KEY,
      ...LEGACY_STORAGE_KEYS.authToken,
      SELECTED_UNIT_ID_KEY,
      ...LEGACY_STORAGE_KEYS.authSelectedUnitId,
      SELECTED_UNIT_NAME_KEY,
      ...LEGACY_STORAGE_KEYS.authSelectedUnitName,
      PREFERRED_UNIT_ID_KEY,
    ]).catch(() => undefined);
    clearSensitiveResidentSessionData().catch(() => undefined);

    emitAppRefresh('mutation', {
      topics: ['unit', 'overview', 'profile', 'messages', 'notifications', 'deliveries', 'alerts', 'visits', 'vehicles', 'cameras', 'realtime'],
      source: 'auth.logout',
    });
  },

  acceptTerms: () => {
    const currentTermsVersion = useAuthStore.getState().currentTermsVersion || CURRENT_TERMS_VERSION;
    const payload = {
      accepted: true,
      version: currentTermsVersion,
      acceptedAt: new Date().toISOString(),
    };

    set({
      hasAcceptedTerms: true,
      acceptedTermsVersion: payload.version,
      acceptedTermsAt: payload.acceptedAt,
    });

    AsyncStorage.setItem(TERMS_KEY, JSON.stringify(payload));
  },

  setCurrentTermsVersion: (value) => {
    const version = value?.trim() || CURRENT_TERMS_VERSION;
    set((state) => ({
      currentTermsVersion: version,
      hasAcceptedTerms: state.acceptedTermsVersion === version && !!state.acceptedTermsAt,
    }));
  },

  setTermsAcceptance: (value) => {
    const currentTermsVersion = useAuthStore.getState().currentTermsVersion || CURRENT_TERMS_VERSION;
    const payload = {
      accepted: value.accepted,
      version: value.version,
      acceptedAt: value.acceptedAt,
    };

    set({
      hasAcceptedTerms: value.accepted === true && value.version === currentTermsVersion,
      acceptedTermsVersion: value.version,
      acceptedTermsAt: value.acceptedAt,
    });

    AsyncStorage.setItem(TERMS_KEY, JSON.stringify(payload));
  },

  refreshTermsAcceptance: async () => {
    const terms = await getStorageItemWithLegacy(TERMS_KEY, LEGACY_STORAGE_KEYS.authTerms);
    const parsedTerms = parseTerms(terms);
    const currentTermsVersion = useAuthStore.getState().currentTermsVersion || CURRENT_TERMS_VERSION;
    set({
      hasAcceptedTerms:
        parsedTerms.acceptedTermsVersion === currentTermsVersion && !!parsedTerms.acceptedTermsAt,
      acceptedTermsVersion: parsedTerms.acceptedTermsVersion,
      acceptedTermsAt: parsedTerms.acceptedTermsAt,
    });
  },

  loadStorage: async () => {
    const user = await getStorageItemWithLegacy(USER_KEY, LEGACY_STORAGE_KEYS.authUser);
    const token = await getStorageItemWithLegacy(TOKEN_KEY, LEGACY_STORAGE_KEYS.authToken);
    const terms = await getStorageItemWithLegacy(TERMS_KEY, LEGACY_STORAGE_KEYS.authTerms);
    const selectedUnitId = await getStorageItemWithLegacy(SELECTED_UNIT_ID_KEY, LEGACY_STORAGE_KEYS.authSelectedUnitId);
    const selectedUnitName = await getStorageItemWithLegacy(
      SELECTED_UNIT_NAME_KEY,
      LEGACY_STORAGE_KEYS.authSelectedUnitName
    );
    const preferredUnitId = await AsyncStorage.getItem(PREFERRED_UNIT_ID_KEY);
    const parsedUser = user ? JSON.parse(user) : null;
    const parsedTerms = parseTerms(terms);

    const resolved = parsedUser
      ? resolveSelectedUnit(parsedUser, selectedUnitId, preferredUnitId, selectedUnitName)
      : null;
    const nextUser = parsedUser && resolved
      ? {
          ...parsedUser,
          selectedUnitId: resolved.selectedUnitId,
          selectedUnitName: resolved.selectedUnitName,
          requiresUnitSelection: resolved.requiresUnitSelection,
        }
      : null;

    set({
      user: nextUser,
      token,
      currentTermsVersion: CURRENT_TERMS_VERSION,
      selectedUnitId: resolved?.selectedUnitId ?? null,
      selectedUnitName: resolved?.selectedUnitName ?? null,
      preferredUnitId: preferredUnitId ?? null,
      residentAppConfig: null,
      hasAcceptedTerms: parsedTerms.hasAcceptedTerms,
      acceptedTermsVersion: parsedTerms.acceptedTermsVersion,
      acceptedTermsAt: parsedTerms.acceptedTermsAt,
    });
  },
}));
