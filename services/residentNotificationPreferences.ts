import api from './api';

export type ResidentNotificationChannel = 'APP' | 'PUSH' | 'EMAIL';
export type ResidentNotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type ResidentNotificationPreferencesRecord = {
  accountId: string | null;
  userId: string | null;
  scopeType: 'ACCOUNT' | string | null;
  channel: ResidentNotificationChannel;
  priority: ResidentNotificationPriority;
};

type ResidentNotificationPreferencesPayload = {
  channel: ResidentNotificationChannel;
  priority: ResidentNotificationPriority;
};

const OFFICIAL_ENDPOINT = '/api/v1/resident/notification-preferences';

function normalizeChannel(value: unknown): ResidentNotificationChannel {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'EMAIL' || normalized === 'APP') return normalized;
  return 'PUSH';
}

function normalizePriority(value: unknown): ResidentNotificationPriority {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'LOW' || normalized === 'MEDIUM') return normalized;
  return 'HIGH';
}

function normalizeRecord(raw: any): ResidentNotificationPreferencesRecord | null {
  const source = raw?.data ?? raw;
  if (!source) return null;

  return {
    accountId: source?.accountId ? String(source.accountId) : null,
    userId: source?.userId ? String(source.userId) : null,
    scopeType: source?.scopeType ? String(source.scopeType) : 'ACCOUNT',
    channel: normalizeChannel(source?.channel),
    priority: normalizePriority(source?.priority),
  };
}

export const residentNotificationPreferencesService = {
  async getCurrentPreferences(): Promise<ResidentNotificationPreferencesRecord | null> {
    try {
      const response = await api.get(OFFICIAL_ENDPOINT);
      return normalizeRecord(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404 || status === 405) {
        return null;
      }
      throw err;
    }
  },

  async persistCurrentPreferences(
    payload: ResidentNotificationPreferencesPayload
  ): Promise<ResidentNotificationPreferencesRecord | null> {
    try {
      const response = await api.put(OFFICIAL_ENDPOINT, {
        channel: payload.channel,
        priority: payload.priority,
      });
      return normalizeRecord(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404 || status === 405) {
        return null;
      }
      throw err;
    }
  },
};
