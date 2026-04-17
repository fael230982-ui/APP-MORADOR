import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, removeStorageItems, STORAGE_KEYS } from '../constants/storage';
import api from './api';
import { getResidentDeviceId } from './deviceIdentity';
import { useAuthStore } from '../store/useAuthStore';

const DEVICE_REGISTRATION_KEY = STORAGE_KEYS.residentDeviceRegistration;

type StoredRegistration = {
  pushToken: string;
  platform: string;
  unitId: string | null;
  deviceId: string | null;
  appVersion: string | null;
};

function sameRegistration(current: StoredRegistration, previous?: StoredRegistration | null) {
  return !!previous &&
    current.pushToken === previous.pushToken &&
    current.platform === previous.platform &&
    current.unitId === previous.unitId &&
    current.deviceId === previous.deviceId &&
    current.appVersion === previous.appVersion;
}

export async function registerResidentDevice() {
  const permissions = await Notifications.getPermissionsAsync();
  const finalPermissions = permissions.granted ? permissions : await Notifications.requestPermissionsAsync();
  if (!finalPermissions.granted) return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  const tokenResult = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  const pushToken = tokenResult.data;
  const unitId = useAuthStore.getState().selectedUnitId;
  const deviceId = await getResidentDeviceId();
  const appVersion = Constants.expoConfig?.version ?? null;

  const currentRegistration: StoredRegistration = {
    pushToken,
    platform: Platform.OS,
    unitId: unitId || null,
    deviceId,
    appVersion,
  };

  const storedValue = await getStorageItemWithLegacy(
    DEVICE_REGISTRATION_KEY,
    LEGACY_STORAGE_KEYS.residentDeviceRegistration
  ).catch(() => null);
  let previousRegistration: StoredRegistration | null = null;
  if (storedValue) {
    try {
      previousRegistration = JSON.parse(storedValue) as StoredRegistration;
    } catch {
      previousRegistration = null;
    }
  }

  if (sameRegistration(currentRegistration, previousRegistration)) {
    return pushToken;
  }

  const payload = {
    pushToken,
    platform: Platform.OS,
    deviceId,
    deviceName: `${Platform.OS} Expo Go`,
    appVersion,
    unitId,
  };

  try {
    await api.post('/api/v1/resident/devices', payload);
    await AsyncStorage.setItem(DEVICE_REGISTRATION_KEY, JSON.stringify(currentRegistration)).catch(() => undefined);
  } catch (err: any) {
    const status = err?.response?.status;
    if (status !== 404 && status !== 403 && status !== 405) {
      throw err;
    }
  }

  return pushToken;
}

export async function clearResidentDeviceRegistrationCache() {
  await removeStorageItems([DEVICE_REGISTRATION_KEY, ...LEGACY_STORAGE_KEYS.residentDeviceRegistration]).catch(
    () => undefined
  );
}
