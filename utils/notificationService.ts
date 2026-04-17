import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BRAND } from '../constants/brand';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '../constants/storage';
import {
  getNotificationSoundDefinition,
  resolveNotificationSoundProfile,
  type NotificationSoundProfile,
} from '../types/notificationSound';
import { PersonRecord } from './peopleRegistry';
import { emitAppRefresh } from './refreshBus';
import { maskPhone } from './privacy';

export interface NotificationPreference {
  id: string;
  personId: string;
  enableExpirationAlerts: boolean;
  daysBeforeExpiration: number;
  enableWhatsAppReminders: boolean;
  reminderTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  personId: string;
  type: 'EXPIRATION_ALERT' | 'WHATSAPP_REMINDER' | 'MANUAL_REMINDER';
  title: string;
  message: string;
  sentAt: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  metadata?: {
    daysUntilExpiration?: number;
    whatsappNumber?: string;
  };
}

export type NotificationCategorySoundMode =
  | 'CUSTOM'
  | 'DEFAULT'
  | 'SILENT';

export type LocalNotificationPrefs = {
  alerts: NotificationCategorySoundMode;
  deliveries: NotificationCategorySoundMode;
  visits: NotificationCategorySoundMode;
  messages: NotificationCategorySoundMode;
  cameras: NotificationCategorySoundMode;
  reports: boolean;
};

type SendLocalNotificationOptions = {
  profile?: NotificationSoundProfile;
};

const PREFERENCES_KEY = STORAGE_KEYS.notificationPreferences;
const LOGS_KEY = STORAGE_KEYS.notificationLogs;
export const LOCAL_NOTIFICATION_PREFS_KEY = STORAGE_KEYS.localNotificationPrefs;

export const DEFAULT_LOCAL_NOTIFICATION_PREFS: LocalNotificationPrefs = {
  alerts: 'CUSTOM',
  deliveries: 'CUSTOM',
  visits: 'CUSTOM',
  messages: 'CUSTOM',
  cameras: 'CUSTOM',
  reports: false,
};

const generateId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const parsePtBrDate = (dateString?: string): Date | null => {
  if (!dateString) return null;

  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;

  const parsed = new Date(year, month - 1, day);
  if (isNaN(parsed.getTime())) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

function resolveLocalNotificationProfile(
  title: string,
  message: string,
  data?: Record<string, any>,
  options?: SendLocalNotificationOptions
): NotificationSoundProfile {
  if (options?.profile) return options.profile;

  return resolveNotificationSoundProfile({
    type: typeof data?.type === 'string' ? data.type : null,
    rawType: typeof data?.rawType === 'string' ? data.rawType : null,
    title,
    body: message,
    data,
  });
}

function normalizeLocalNotificationPrefs(raw: any): LocalNotificationPrefs {
  const normalizeSoundMode = (
    value: unknown,
    legacyFallback: unknown,
    fallback: NotificationCategorySoundMode
  ): NotificationCategorySoundMode => {
    if (value === 'CUSTOM' || value === 'DEFAULT' || value === 'SILENT') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.toUpperCase();
      if (normalized === 'CUSTOM' || normalized === 'DEFAULT' || normalized === 'SILENT') {
        return normalized;
      }
    }

    if (typeof value === 'boolean') {
      return value ? 'CUSTOM' : 'DEFAULT';
    }

    if (typeof legacyFallback === 'boolean') {
      return legacyFallback ? 'CUSTOM' : 'DEFAULT';
    }

    return fallback;
  };

  return {
    alerts: normalizeSoundMode(raw?.alerts, raw?.critical, DEFAULT_LOCAL_NOTIFICATION_PREFS.alerts),
    deliveries: normalizeSoundMode(raw?.deliveries, undefined, DEFAULT_LOCAL_NOTIFICATION_PREFS.deliveries),
    visits: normalizeSoundMode(raw?.visits, undefined, DEFAULT_LOCAL_NOTIFICATION_PREFS.visits),
    messages: normalizeSoundMode(raw?.messages, undefined, DEFAULT_LOCAL_NOTIFICATION_PREFS.messages),
    cameras: normalizeSoundMode(raw?.cameras, undefined, DEFAULT_LOCAL_NOTIFICATION_PREFS.cameras),
    reports: raw?.reports ?? DEFAULT_LOCAL_NOTIFICATION_PREFS.reports,
  };
}

function resolveStoredSoundProfile(
  profile: NotificationSoundProfile,
  prefs: LocalNotificationPrefs
) {
  if (profile === 'ALERT') return prefs.alerts;
  if (profile === 'DELIVERY') return prefs.deliveries;
  if (profile === 'VISIT') return prefs.visits;
  if (profile === 'MESSAGE') return prefs.messages;
  if (profile === 'CAMERA') return prefs.cameras;
  return 'DEFAULT';
}

export async function getLocalNotificationPrefs(): Promise<LocalNotificationPrefs> {
  try {
    const data = await getStorageItemWithLegacy(LOCAL_NOTIFICATION_PREFS_KEY, LEGACY_STORAGE_KEYS.localNotificationPrefs);
    if (!data) return DEFAULT_LOCAL_NOTIFICATION_PREFS;
    return normalizeLocalNotificationPrefs(JSON.parse(data));
  } catch (error) {
    console.error('Erro ao obter preferencias locais de notificacao:', error);
    return DEFAULT_LOCAL_NOTIFICATION_PREFS;
  }
}

export async function saveLocalNotificationPrefs(
  prefs: LocalNotificationPrefs
): Promise<LocalNotificationPrefs> {
  const normalized = normalizeLocalNotificationPrefs(prefs);
  await AsyncStorage.setItem(
    LOCAL_NOTIFICATION_PREFS_KEY,
    JSON.stringify(normalized)
  );
  return normalized;
}

async function buildNotificationContent(
  title: string,
  message: string,
  data?: Record<string, any>,
  options?: SendLocalNotificationOptions
): Promise<Notifications.NotificationContentInput> {
  const requestedProfile = resolveLocalNotificationProfile(title, message, data, options);
  const prefs = await getLocalNotificationPrefs();
  const soundMode = resolveStoredSoundProfile(requestedProfile, prefs);
  const profile = soundMode === 'CUSTOM' ? requestedProfile : 'DEFAULT';
  const definition = getNotificationSoundDefinition(profile);
  const payload = {
    ...(data || {}),
    notificationSoundProfile: profile,
    notificationRequestedSoundProfile: requestedProfile,
    notificationSoundMode: soundMode,
  };

  return {
    title,
    body: message,
    sound: soundMode === 'SILENT' ? undefined : definition.soundFileName ?? 'default',
    data: payload,
    ...(Platform.OS === 'android' ? { channelId: definition.channelId } : {}),
  };
}

export const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const ensureNotificationChannels = async () => {
  if (Platform.OS !== 'android') return;

  const profiles: NotificationSoundProfile[] = [
    'DEFAULT',
    'DELIVERY',
    'VISIT',
    'ALERT',
    'MESSAGE',
    'CAMERA',
  ];

  await Promise.all(
    profiles.map(async (profile) => {
      const definition = getNotificationSoundDefinition(profile);

      await Notifications.setNotificationChannelAsync(definition.channelId, {
        name: `${BRAND.notificationChannelPrefix} ${definition.label}`,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 220, 180, 220],
        enableLights: true,
        enableVibrate: true,
        lightColor: '#2DD4BF',
        sound: definition.soundFileName ?? 'default',
      });
    })
  );
};

export const setupNotificationRefreshBridge = () => {
  const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
    emitAppRefresh('notification');
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {
    emitAppRefresh('notification');
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

export const getNotificationPreference = async (
  personId: string
): Promise<NotificationPreference | null> => {
  try {
    const data = await getStorageItemWithLegacy(PREFERENCES_KEY, LEGACY_STORAGE_KEYS.notificationPreferences);
    if (!data) return null;

    const preferences: NotificationPreference[] = JSON.parse(data);
    return preferences.find((p) => p.personId === personId) || null;
  } catch (error) {
    console.error('Erro ao obter preferencias:', error);
    return null;
  }
};

export const saveNotificationPreference = async (
  preference: Omit<NotificationPreference, 'createdAt' | 'updatedAt'>
): Promise<NotificationPreference> => {
  try {
    const data = await AsyncStorage.getItem(PREFERENCES_KEY);
    const preferences: NotificationPreference[] = data ? JSON.parse(data) : [];

    const now = new Date().toISOString();
    const existingIndex = preferences.findIndex(
      (p) => p.personId === preference.personId
    );

    const newPreference: NotificationPreference = {
      ...preference,
      createdAt:
        existingIndex >= 0 ? preferences[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      preferences[existingIndex] = newPreference;
    } else {
      preferences.push(newPreference);
    }

    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    return newPreference;
  } catch (error) {
    console.error('Erro ao salvar preferencias:', error);
    throw error;
  }
};

export const logNotification = async (
  notification: Omit<NotificationLog, 'id'>
): Promise<NotificationLog> => {
  try {
    const data = await getStorageItemWithLegacy(LOGS_KEY, LEGACY_STORAGE_KEYS.notificationLogs);
    const logs: NotificationLog[] = data ? JSON.parse(data) : [];

    const newLog: NotificationLog = {
      ...notification,
      id: generateId('notif'),
    };

    logs.push(newLog);

    const trimmedLogs = logs.slice(-100);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(trimmedLogs));

    return newLog;
  } catch (error) {
    console.error('Erro ao registrar notificacao:', error);
    throw error;
  }
};

export const getNotificationHistory = async (
  personId?: string,
  limit: number = 50
): Promise<NotificationLog[]> => {
  try {
    const data = await getStorageItemWithLegacy(LOGS_KEY, LEGACY_STORAGE_KEYS.notificationLogs);
    if (!data) return [];

    let logs: NotificationLog[] = JSON.parse(data);

    if (personId) {
      logs = logs.filter((l) => l.personId === personId);
    }

    return logs.slice(-limit).reverse();
  } catch (error) {
    console.error('Erro ao obter historico:', error);
    return [];
  }
};

export const sendLocalNotification = async (
  title: string,
  message: string,
  data?: Record<string, any>,
  options?: SendLocalNotificationOptions
): Promise<string> => {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (!permissions.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) {
        throw new Error('Permissao de notificacao negada');
      }
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: await buildNotificationContent(title, message, data, options),
      trigger: null,
    });

    return notificationId;
  } catch (error) {
    console.error('Erro ao enviar notificacao:', error);
    throw error;
  }
};

export const scheduleNotificationAtTime = async (
  title: string,
  message: string,
  time: string,
  data?: Record<string, any>,
  options?: SendLocalNotificationOptions
): Promise<string> => {
  try {
    const [hours, minutes] = time.split(':').map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new Error('Horario invalido');
    }

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const secondsUntilNotification = Math.max(
      1,
      Math.floor((scheduledTime.getTime() - now.getTime()) / 1000)
    );

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: await buildNotificationContent(title, message, data, options),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilNotification,
        repeats: false,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Erro ao agendar notificacao:', error);
    throw error;
  }
};

export const checkExpiringRegistrations = async (
  people: PersonRecord[],
  daysThreshold: number = 7
): Promise<PersonRecord[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + daysThreshold);

    return people.filter((person) => {
      if (!person.endDate) return false;
      if (person.status === 'INATIVO') return false;

      const endDate = parsePtBrDate(person.endDate);
      if (!endDate) return false;

      return endDate >= today && endDate <= maxDate;
    });
  } catch (error) {
    console.error('Erro ao verificar expiracao:', error);
    return [];
  }
};

export const sendWhatsAppReminder = async (
  personName: string,
  phoneNumber: string,
  daysUntilExpiration: number,
  expirationDate: string
): Promise<boolean> => {
  try {
    const message =
      `Ola!\n\n` +
      `Este e um lembrete de que o cadastro de ${personName} expira em ${daysUntilExpiration} dia(s) (${expirationDate}).\n\n` +
      `Por favor, renove o cadastro para manter o acesso autorizado.\n\n` +
      `Atenciosamente,\nSistema ${BRAND.appName}`;

    console.log(`WhatsApp enviado para ${phoneNumber}: ${message}`);

    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
};

export const processPendingNotifications = async (
  people: PersonRecord[]
): Promise<void> => {
  try {
    const preferencesData = await getStorageItemWithLegacy(PREFERENCES_KEY, LEGACY_STORAGE_KEYS.notificationPreferences);
    const preferences: NotificationPreference[] = preferencesData
      ? JSON.parse(preferencesData)
      : [];

    for (const person of people) {
      const preference = preferences.find((p) => p.personId === person.id);

      if (!preference || !preference.enableExpirationAlerts) {
        continue;
      }

      const expiringPeople = await checkExpiringRegistrations(
        [person],
        preference.daysBeforeExpiration
      );

      if (expiringPeople.length === 0) {
        continue;
      }

      const endDate = parsePtBrDate(person.endDate);
      if (!endDate) {
        continue;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daysUntilExpiration = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      await sendLocalNotification(
        'Cadastro prestes a expirar',
        `${person.name} expira em ${daysUntilExpiration} dia(s)`,
        {
          personId: person.id,
          personName: person.name,
          daysUntilExpiration,
        },
        { profile: 'ALERT' }
      );

      await logNotification({
        personId: person.id,
        type: 'EXPIRATION_ALERT',
        title: 'Cadastro prestes a expirar',
        message: `${person.name} expira em ${daysUntilExpiration} dia(s)`,
        sentAt: new Date().toISOString(),
        status: 'SENT',
        metadata: {
          daysUntilExpiration,
        },
      });

      if (preference.enableWhatsAppReminders) {
        const whatsappSent = await sendWhatsAppReminder(
          person.name,
          person.phone,
          daysUntilExpiration,
          person.endDate || ''
        );

        await logNotification({
          personId: person.id,
          type: 'WHATSAPP_REMINDER',
          title: whatsappSent
            ? 'Lembrete WhatsApp enviado'
            : 'Falha ao enviar lembrete WhatsApp',
          message: whatsappSent
            ? `Lembrete enviado para ${maskPhone(person.phone)}`
            : `Falha ao enviar para ${maskPhone(person.phone)}`,
          sentAt: new Date().toISOString(),
          status: whatsappSent ? 'SENT' : 'FAILED',
          metadata: {
            whatsappNumber: maskPhone(person.phone),
            daysUntilExpiration,
          },
        });
      }
    }
  } catch (error) {
    console.error('Erro ao processar notificacoes:', error);
  }
};

export const clearOldNotifications = async (
  daysOld: number = 30
): Promise<void> => {
  try {
    const data = await getStorageItemWithLegacy(LOGS_KEY, LEGACY_STORAGE_KEYS.notificationLogs);
    if (!data) return;

    const logs: NotificationLog[] = JSON.parse(data);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const filteredLogs = logs.filter(
      (log) => new Date(log.sentAt) > cutoffDate
    );

    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(filteredLogs));
  } catch (error) {
    console.error('Erro ao limpar notificacoes:', error);
  }
};
