import api, { resolveApiUrl } from './api';
import { normalizeResidentNotificationType, type ResidentNotification } from '../types/residentNotification';
import { resolveNotificationSoundProfile } from '../types/notificationSound';
import { emitAppRefresh } from '../utils/refreshBus';

function normalizeNotification(raw: any): ResidentNotification {
  const type = normalizeResidentNotificationType(raw?.type);
  const payload = raw?.payload ?? raw?.data ?? null;

  return {
    id: String(raw?.id ?? ''),
    type,
    rawType: raw?.type ? String(raw.type) : null,
    domain: raw?.domain ? String(raw.domain) : null,
    title: String(raw?.title ?? raw?.subject ?? 'Notificacao'),
    body: String(raw?.body ?? raw?.message ?? ''),
    channel: raw?.channel ?? null,
    status: raw?.status ?? null,
    unitId: raw?.unitId ?? raw?.unit?.id ?? null,
    unitLabel: raw?.unitLabel ?? raw?.unit?.label ?? raw?.unitName ?? null,
    deliveryId: raw?.deliveryId ?? null,
    messageId: raw?.messageId ?? raw?.operationMessageId ?? null,
    alertId: raw?.alertId ?? raw?.alarmId ?? null,
    cameraId: raw?.cameraId ?? null,
    visitForecastId: raw?.visitForecastId ?? raw?.visitId ?? null,
    personId: raw?.personId ?? null,
    snapshotUrl: resolveApiUrl(raw?.snapshotUrl ?? raw?.photoUrl ?? null),
    replayUrl: resolveApiUrl(raw?.replayUrl ?? null),
    payload,
    soundProfile: resolveNotificationSoundProfile({
      type,
      rawType: raw?.type ? String(raw.type) : null,
      title: raw?.title ?? raw?.subject ?? null,
      body: raw?.body ?? raw?.message ?? null,
      data: payload,
    }),
    readAt: raw?.readAt ?? raw?.read_at ?? null,
    createdAt: raw?.createdAt ?? raw?.created_at ?? null,
  };
}

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.notifications)) return data.notifications;
  return [];
}

export const residentNotificationsService = {
  async list(unreadOnly = false): Promise<ResidentNotification[]> {
    const response = await api.get('/api/v1/resident/notifications', {
      params: unreadOnly ? { unreadOnly: true } : undefined,
    });

    return extractItems(response.data).map(normalizeNotification).filter((item) => item.id);
  },

  async markAsRead(id: string): Promise<ResidentNotification | null> {
    const response = await api.patch(`/api/v1/resident/notifications/${id}/read`);
    if (!response.data) return null;
    const notification = normalizeNotification(response.data);
    emitAppRefresh('mutation', { topics: ['notifications', 'overview', 'profile'], source: 'residentNotifications.markAsRead' });
    return notification.id ? notification : null;
  },

  async markAllAsRead(): Promise<number> {
    const response = await api.patch('/api/v1/resident/notifications/read-all');
    emitAppRefresh('mutation', { topics: ['notifications', 'overview', 'profile'], source: 'residentNotifications.markAllAsRead' });
    return Number(response.data?.updatedCount ?? response.data?.updated ?? response.data?.count ?? 0);
  },
};
