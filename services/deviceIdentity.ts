import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '../constants/storage';

const RESIDENT_DEVICE_ID_KEY = STORAGE_KEYS.residentDeviceId;

function generateResidentDeviceId() {
  return `resident-device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function getResidentDeviceId() {
  const stored = await getStorageItemWithLegacy(RESIDENT_DEVICE_ID_KEY, LEGACY_STORAGE_KEYS.residentDeviceId).catch(
    () => null
  );
  if (stored) return stored;

  const generated = generateResidentDeviceId();
  await AsyncStorage.setItem(RESIDENT_DEVICE_ID_KEY, generated).catch(() => undefined);
  return generated;
}
