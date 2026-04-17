import type { NotificationSoundProfile } from './notificationSound';

export type ResidentNotificationType =
  | 'DELIVERY_EVENT'
  | 'ACCESS_EVENT'
  | 'OPERATION_MESSAGE'
  | 'SECURITY_ALERT'
  | 'CAMERA_EVENT'
  | 'GENERIC';

export type ResidentNotificationDomain =
  | 'DELIVERY'
  | 'ACCESS'
  | 'MESSAGE'
  | 'ALERT'
  | 'CAMERA'
  | 'GENERIC'
  | string;

export type ResidentNotification = {
  id: string;
  type: ResidentNotificationType | string;
  rawType?: string | null;
  domain?: ResidentNotificationDomain | null;
  title: string;
  body: string;
  channel?: string | null;
  status?: string | null;
  unitId?: string | null;
  unitLabel?: string | null;
  deliveryId?: string | null;
  messageId?: string | null;
  alertId?: string | null;
  cameraId?: string | null;
  visitForecastId?: string | null;
  personId?: string | null;
  snapshotUrl?: string | null;
  replayUrl?: string | null;
  payload?: Record<string, unknown> | null;
  soundProfile?: NotificationSoundProfile;
  readAt?: string | null;
  createdAt?: string | null;
};

export function normalizeResidentNotificationType(value: unknown): ResidentNotificationType {
  const type = String(value || 'GENERIC').toUpperCase();

  if (type === 'DELIVERY_RECEIVED' || type === 'DELIVERY_WITHDRAWN') return 'DELIVERY_EVENT';
  if (type === 'DELIVERY_PENDING_WITHDRAWAL') return 'DELIVERY_EVENT';
  if (type === 'VISIT_FORECAST' || type === 'VISIT_ARRIVED' || type === 'ACCESS_ACTIVITY') return 'ACCESS_EVENT';
  if (type === 'MESSAGE_CREATED' || type === 'PORTARIA_MESSAGE' || type === 'MESSAGE_RECEIVED') return 'OPERATION_MESSAGE';
  if (type === 'ALERT_CREATED' || type === 'HOUSEHOLD_ALERT') return 'SECURITY_ALERT';
  if (type === 'CAMERA_STATUS_CHANGED') return 'CAMERA_EVENT';
  return 'GENERIC';
}
