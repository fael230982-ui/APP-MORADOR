import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, removeStorageItems, STORAGE_KEYS } from '../constants/storage';

const RESOLVED_ALERTS_KEY = STORAGE_KEYS.resolvedAlertIds;
const MAX_RESOLVED_ALERT_IDS = 200;

export async function getLocallyResolvedAlertIds(): Promise<string[]> {
  try {
    const raw = await getStorageItemWithLegacy(RESOLVED_ALERTS_KEY, LEGACY_STORAGE_KEYS.resolvedAlertIds);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function markAlertResolvedLocally(id: string) {
  const current = await getLocallyResolvedAlertIds();
  const next = Array.from(new Set([...current, id])).slice(-MAX_RESOLVED_ALERT_IDS);
  await AsyncStorage.setItem(RESOLVED_ALERTS_KEY, JSON.stringify(next));
}

export async function markAlertUnreadLocally(id: string) {
  const current = await getLocallyResolvedAlertIds();
  const next = current.filter((item) => item !== id);
  await AsyncStorage.setItem(RESOLVED_ALERTS_KEY, JSON.stringify(next));
}

export async function pruneResolvedAlertIds(limit = MAX_RESOLVED_ALERT_IDS) {
  const current = await getLocallyResolvedAlertIds();
  const next = Array.from(new Set(current)).slice(-limit);
  await AsyncStorage.setItem(RESOLVED_ALERTS_KEY, JSON.stringify(next));
}

export async function clearResolvedAlertIds() {
  await removeStorageItems([RESOLVED_ALERTS_KEY, ...LEGACY_STORAGE_KEYS.resolvedAlertIds]);
}
