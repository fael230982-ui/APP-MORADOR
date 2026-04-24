import { listAccessLogs, type AccessLog } from './accessLogs';
import { getAlarmSummary } from './alarms';
import { cameraService } from './cameraService';
import { deliveriesService } from './deliveries';
import { facialStatusService, type FacialSyncStatus } from './facialStatus';
import { isUnreadIncomingOperationMessage, operationMessagesService } from './operationMessages';
import { residentNotificationsService } from './residentNotifications';
import { vehiclesService } from './vehicles';
import { listVisitForecasts, type VisitForecast } from './visitForecasts';
import { useAuthStore } from '../store/useAuthStore';

export type ResidentOverviewSnapshot = {
  selectedUnitId: string | null;
  generatedAt: string;
  alerts: {
    available: boolean;
    unauthorized: number;
    underReview: number;
    active: number;
    latestDetectedAt?: string | null;
    latestTitle?: string | null;
    latestLocation?: string | null;
    latestTypeLabel?: string | null;
  };
  deliveries: {
    available: boolean;
    total: number;
    pending: number;
    notificationsAvailable: boolean;
    accessDenied: boolean;
  };
  visits: {
    available: boolean;
    scheduled: number;
    arrived: number;
    upcoming: VisitForecast[];
  };
  messages: {
    available: boolean;
    unread: number;
  };
  notifications: {
    available: boolean;
    unread: number;
  };
  cameras: {
    available: boolean;
    total: number;
  };
  vehicles: {
    available: boolean;
    total: number;
  };
  accessLogs: {
    available: boolean;
    recent: AccessLog[];
  };
  facial: FacialSyncStatus;
};

type Options = {
  logLimit?: number;
  messageLimit?: number;
  upcomingVisitsLimit?: number;
};

export async function loadResidentOverview(options: Options = {}): Promise<ResidentOverviewSnapshot> {
  const { selectedUnitId, user } = useAuthStore.getState();
  const effectiveUnitId =
    selectedUnitId ??
    user?.selectedUnitId ??
    user?.unitId ??
    (user?.unitIds && user.unitIds.length === 1 ? user.unitIds[0] : null);
  const logLimit = options.logLimit ?? 5;
  const messageLimit = options.messageLimit ?? 20;
  const upcomingVisitsLimit = options.upcomingVisitsLimit ?? 3;

  const [summaryResult, deliveryResult, forecastResult, logResult, cameraResult, vehicleResult, messageResult, notificationResult, facialResult] = await Promise.allSettled([
    getAlarmSummary(),
    effectiveUnitId ? deliveriesService.listResidentDeliveries() : Promise.resolve(null),
    effectiveUnitId ? listVisitForecasts(effectiveUnitId) : Promise.resolve([]),
    effectiveUnitId ? listAccessLogs(logLimit) : Promise.resolve([]),
    effectiveUnitId ? cameraService.getUnitCameras() : Promise.resolve([]),
    effectiveUnitId ? vehiclesService.listUnitVehicles() : Promise.resolve([]),
    effectiveUnitId ? operationMessagesService.list(effectiveUnitId, { unreadOnly: true, limit: messageLimit }) : Promise.resolve([]),
    effectiveUnitId ? residentNotificationsService.list(true) : Promise.resolve([]),
    facialStatusService.get(),
  ]);

  const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
  const deliveries = deliveryResult.status === 'fulfilled' ? deliveryResult.value : null;
  const forecasts = forecastResult.status === 'fulfilled' ? forecastResult.value : [];
  const logs = logResult.status === 'fulfilled' ? logResult.value : [];
  const cameras = cameraResult.status === 'fulfilled' ? cameraResult.value : [];
  const vehicles = vehicleResult.status === 'fulfilled' ? vehicleResult.value : [];
  const messages = messageResult.status === 'fulfilled' ? messageResult.value : [];
  const notifications = notificationResult.status === 'fulfilled' ? notificationResult.value : [];
  const facial =
    facialResult.status === 'fulfilled'
      ? facialResult.value
      : ({ state: 'UNKNOWN', updatedAt: null, photoUri: null } as FacialSyncStatus);

  const pendingForecasts = forecasts
    .filter((visit) => !visit.arrivedAt && visit.status !== 'EXPIRED' && visit.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.expectedEntryAt || '').getTime() - new Date(b.expectedEntryAt || '').getTime());

  return {
    selectedUnitId: effectiveUnitId,
    generatedAt: new Date().toISOString(),
    alerts: {
      available: summaryResult.status === 'fulfilled',
      unauthorized: summary?.unauthorized || 0,
      underReview: summary?.underReview || 0,
      active: (summary?.unauthorized || 0) + (summary?.underReview || 0),
      latestDetectedAt: summary?.latestDetectedAt || null,
      latestTitle: summary?.latestTitle || null,
      latestLocation: summary?.latestLocation || null,
      latestTypeLabel: summary?.latestTypeLabel || null,
    },
    deliveries: {
      available: deliveryResult.status === 'fulfilled',
      total: deliveries?.deliveries.length || 0,
      pending: deliveries?.deliveries.filter((item) => item.status !== 'WITHDRAWN').length || 0,
      notificationsAvailable: deliveries?.notificationsAvailable ?? false,
      accessDenied: !!deliveries?.accessDenied,
    },
    visits: {
      available: forecastResult.status === 'fulfilled',
      scheduled: pendingForecasts.length,
      arrived: forecasts.filter((visit) => !!visit.arrivedAt).length,
      upcoming: pendingForecasts.slice(0, upcomingVisitsLimit),
    },
    messages: {
      available: messageResult.status === 'fulfilled',
      unread: messages.filter(isUnreadIncomingOperationMessage).length,
    },
    notifications: {
      available: notificationResult.status === 'fulfilled',
      unread: notifications.length,
    },
    cameras: {
      available: cameraResult.status === 'fulfilled',
      total: cameras.length,
    },
    vehicles: {
      available: vehicleResult.status === 'fulfilled',
      total: vehicles.length,
    },
    accessLogs: {
      available: logResult.status === 'fulfilled',
      recent: logs.slice(0, logLimit),
    },
    facial,
  };
}
