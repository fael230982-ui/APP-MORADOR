import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_NAMESPACE = (process.env.EXPO_PUBLIC_STORAGE_NAMESPACE || 'resident_app')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9_]+/g, '_');

function normalizeKeyName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
}

export function getStorageKey(name: string) {
  return `@${STORAGE_NAMESPACE}_${normalizeKeyName(name)}`;
}

export async function getStorageItemWithLegacy(
  primaryKey: string,
  legacyKeys: string[] = []
): Promise<string | null> {
  const currentValue = await AsyncStorage.getItem(primaryKey);
  if (currentValue !== null) return currentValue;

  for (const legacyKey of legacyKeys) {
    const legacyValue = await AsyncStorage.getItem(legacyKey);
    if (legacyValue !== null) {
      await AsyncStorage.setItem(primaryKey, legacyValue).catch(() => undefined);
      return legacyValue;
    }
  }

  return null;
}

export async function removeStorageItems(keys: string[]) {
  if (!keys.length) return;
  await AsyncStorage.multiRemove(keys).catch(async () => {
    await Promise.all(keys.map((key) => AsyncStorage.removeItem(key).catch(() => undefined)));
  });
}

export const STORAGE_KEYS = {
  authUser: getStorageKey('user'),
  authToken: getStorageKey('token'),
  authTerms: getStorageKey('terms'),
  authSelectedUnitId: getStorageKey('selected_unit_id'),
  authSelectedUnitName: getStorageKey('selected_unit_name'),
  permissionUsers: getStorageKey('users'),
  residentDeviceId: getStorageKey('resident_device_id'),
  residentDeviceRegistration: getStorageKey('registered_resident_device'),
  facialSyncStatus: getStorageKey('facial_sync_status'),
  residentProfileDraft: getStorageKey('resident_profile_draft'),
  resolvedAlertIds: getStorageKey('resolved_alert_ids'),
  notifiedArrivedVisits: getStorageKey('notified_arrived_visits'),
  peopleRegistry: getStorageKey('people_registry'),
  notificationPreferences: getStorageKey('notification_preferences'),
  notificationLogs: getStorageKey('notification_logs'),
  localNotificationPrefs: getStorageKey('local_notification_prefs'),
} as const;

export const LEGACY_STORAGE_KEYS = {
  authUser: ['@v8_user'],
  authToken: ['@v8_token'],
  authTerms: ['@v8_terms'],
  authSelectedUnitId: ['@v8_selected_unit_id'],
  authSelectedUnitName: ['@v8_selected_unit_name'],
  permissionUsers: ['@v8_users'],
  residentDeviceId: ['@v8_resident_device_id'],
  residentDeviceRegistration: ['@v8_registered_resident_device'],
  facialSyncStatus: ['@v8_facial_sync_status'],
  residentProfileDraft: ['@v8_resident_profile_draft'],
  resolvedAlertIds: ['@v8_resolved_alert_ids'],
  notifiedArrivedVisits: ['@v8_notified_arrived_visits'],
  peopleRegistry: ['@v8_people_registry'],
  notificationPreferences: ['@v8_notification_preferences'],
  notificationLogs: ['@v8_notification_logs'],
  localNotificationPrefs: ['@v8_local_notification_prefs'],
} as const;
