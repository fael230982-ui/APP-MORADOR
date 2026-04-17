import { listAccessLogs, type AccessLog } from './accessLogs';
import { getAlarmSummary } from './alarms';
import { cameraService } from './cameraService';
import { deliveriesService } from './deliveries';
import { facialStatusService, type FacialSyncStatus } from './facialStatus';
import { operationMessagesService } from './operationMessages';
import { residentNotificationsService } from './residentNotifications';
import { vehiclesService } from './vehicles';
import { listVisitForecasts, type VisitForecast } from './visitForecasts';
import { useAuthStore } from '../store/useAuthStore';

export type ResidentOverviewSnapshot = {
  selectedUnitId: string | null;
  generatedAt: string;
  alerts: {
    unauthorized: number;
    underReview: number;
    active: number;
    latestDetectedAt?: string | null;
    latestTitle?: string | null;
    latestLocation?: string | null;
    latestTypeLabel?: string | null;
  };
  deliveries: {
    total: number;
    pending: number;
    notificationsAvailable: boolean;
    accessDenied: boolean;
  };
  visits: {
    scheduled: number;
    arrived: number;
    upcoming: VisitForecast[];
  };
  messages: {
    unread: number;
  };
  notifications: {
    unread: number;
  };
  cameras: {
    total: number;
  };
  vehicles: {
    total: number;
  };
  accessLogs: {
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
  const { selectedUnitId } = useAuthStore.getState();
  const logLimit = options.logLimit ?? 5;
  const messageLimit = options.messageLimit ?? 20;
  const upcomingVisitsLimit = options.upcomingVisitsLimit ?? 3;

  const [summary, deliveryResult, forecastResult, logResult, cameraResult, vehicleResult, messageResult, notificationResult, facialResult] = await Promise.all([
    getAlarmSummary().catch(() => null),
    selectedUnitId ? deliveriesService.listResidentDeliveries().catch(() => null) : Promise.resolve(null),
    selectedUnitId ? listVisitForecasts(selectedUnitId).catch(() => []) : Promise.resolve([]),
    selectedUnitId ? listAccessLogs(logLimit).catch(() => []) : Promise.resolve([]),
    selectedUnitId ? cameraService.getUnitCameras().catch(() => []) : Promise.resolve([]),
    selectedUnitId ? vehiclesService.listUnitVehicles().catch(() => []) : Promise.resolve([]),
    selectedUnitId ? operationMessagesService.list(selectedUnitId, { unreadOnly: true, limit: messageLimit }).catch(() => []) : Promise.resolve([]),
    selectedUnitId ? residentNotificationsService.list(true).catch(() => []) : Promise.resolve([]),
    facialStatusService.get().catch((): FacialSyncStatus => ({ state: 'UNKNOWN', updatedAt: null, photoUri: null })),
  ]);

  const pendingForecasts = forecastResult
    .filter((visit) => !visit.arrivedAt && visit.status !== 'EXPIRED' && visit.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.expectedEntryAt || '').getTime() - new Date(b.expectedEntryAt || '').getTime());

  return {
    selectedUnitId,
    generatedAt: new Date().toISOString(),
    alerts: {
      unauthorized: summary?.unauthorized || 0,
      underReview: summary?.underReview || 0,
      active: (summary?.unauthorized || 0) + (summary?.underReview || 0),
      latestDetectedAt: summary?.latestDetectedAt || null,
      latestTitle: summary?.latestTitle || null,
      latestLocation: summary?.latestLocation || null,
      latestTypeLabel: summary?.latestTypeLabel || null,
    },
    deliveries: {
      total: deliveryResult?.deliveries.length || 0,
      pending:
        deliveryResult?.deliveries.filter((item) => item.status !== 'WITHDRAWN').length || 0,
      notificationsAvailable: deliveryResult?.notificationsAvailable ?? false,
      accessDenied: !!deliveryResult?.accessDenied,
    },
    visits: {
      scheduled: pendingForecasts.length,
      arrived: forecastResult.filter((visit) => !!visit.arrivedAt).length,
      upcoming: pendingForecasts.slice(0, upcomingVisitsLimit),
    },
    messages: {
      unread: messageResult.length,
    },
    notifications: {
      unread: notificationResult.length,
    },
    cameras: {
      total: cameraResult.length,
    },
    vehicles: {
      total: vehicleResult.length,
    },
    accessLogs: {
      recent: logResult.slice(0, logLimit),
    },
    facial: facialResult,
  };
}
