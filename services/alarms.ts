import api, { resolveApiUrl } from './api';
import { getLocallyResolvedAlertIds } from './localAlertState';
import type { AlarmItem } from '../types/alarm';

type WeeklyStat = {
  day: string;
  count: number;
};

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function mapAlertStatus(raw: any): AlarmItem['status'] {
  const status = String(raw?.status || '').toUpperCase();
  return status === 'READ' ? 'READ' : 'UNREAD';
}

function mapCanonicalAlertStatus(status: AlarmItem['status']): AlarmItem['canonicalStatus'] {
  if (status === 'READ') return 'READ';
  return 'OPEN';
}

function statusLabel(status: AlarmItem['status']) {
  if (status === 'READ') return 'Lido';
  return 'Nao lido';
}

function severityRank(status: AlarmItem['status']) {
  if (status === 'UNREAD') return 2;
  return 0;
}

function mapAlertSeverity(raw: any): AlarmItem['severity'] {
  const severity = String(raw?.severity || '').toUpperCase();
  if (severity === 'CRITICAL' || severity === 'HIGH' || severity === 'MEDIUM') {
    return severity as AlarmItem['severity'];
  }

  const type = String(raw?.type || '').toUpperCase();
  if (['DANGER', 'PANIC', 'UNKNOWN_PERSON', 'ACCESS_DENIED'].includes(type)) return 'CRITICAL';
  if (type === 'WARNING' || type === 'CAMERA_OFFLINE') return 'HIGH';
  return 'LOW';
}

function alertTypeLabel(type: unknown) {
  const normalized = String(type || '').toUpperCase();

  if (normalized === 'UNKNOWN_PERSON') return 'Pessoa sem cadastro';
  if (normalized === 'ACCESS_DENIED') return 'Acesso negado';
  if (normalized === 'CAMERA_OFFLINE') return 'Camera offline';
  if (normalized === 'PANIC') return 'Panico';
  if (normalized === 'DANGER') return 'Seguranca';
  if (normalized === 'WARNING') return 'Aviso';
  return 'Alerta';
}

function normalizeAlert(raw: any): AlarmItem {
  const status = mapAlertStatus(raw);

  return {
    id: String(raw?.id ?? ''),
    title: String(raw?.title ?? raw?.typeLabel ?? 'Alerta'),
    description: raw?.description ?? raw?.message ?? null,
    type: String(raw?.type ?? 'GENERIC').toUpperCase(),
    typeLabel: alertTypeLabel(raw?.type),
    location: raw?.location ?? raw?.cameraName ?? raw?.unitLabel ?? 'Local nao informado',
    detectedAt: raw?.detectedAt ?? raw?.timestamp ?? raw?.createdAt ?? '',
    status,
    statusLabel: statusLabel(status),
    canonicalStatus: mapCanonicalAlertStatus(status),
    severity: mapAlertSeverity(raw),
    severityRank: severityRank(status),
    cameraId: raw?.cameraId ?? null,
    snapshotUrl: resolveApiUrl(raw?.photoUrl ?? raw?.snapshotUrl ?? raw?.thumbnailUrl ?? null),
    confidence: typeof raw?.confidence === 'number' ? raw.confidence : (typeof raw?.score === 'number' ? raw.score : null),
    readAt: raw?.readAt ?? null,
    origin: raw?.origin ? String(raw.origin) : null,
    audience: raw?.audience ? String(raw.audience) : null,
    readState: raw?.workflow === 'READ_STATE' || raw?.readState ? String(raw?.workflow ?? raw?.readState) : 'READ_STATE',
    workflowStatus: raw?.workflowStatus ? String(raw.workflowStatus) : null,
    openedAt: raw?.openedAt ?? null,
    resolvedAt: raw?.resolvedAt ?? null,
    returnedToQueueAt: raw?.returnedToQueueAt ?? null,
    responsibleUserName: raw?.responsibleUserName ?? raw?.assignedUserName ?? null,
    resolutionNote: raw?.resolutionNote ?? null,
  };
}

async function listAlerts(params?: Record<string, unknown>): Promise<AlarmItem[]> {
  if (process.env.EXPO_PUBLIC_USE_MOCKS === 'true') {
    return [];
  }

  const response = await api.get('/api/v1/alerts', {
    params: {
      limit: 100,
      ...params,
    },
  });

  return extractItems(response.data)
    .map(normalizeAlert)
    .filter((alert) => alert.id)
    .sort((a, b) => {
      if ((b.severityRank ?? 0) !== (a.severityRank ?? 0)) {
        return (b.severityRank ?? 0) - (a.severityRank ?? 0);
      }
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });
}

export async function getAlarmsByStatus(status: string): Promise<AlarmItem[]> {
  const [alerts, locallyResolvedIds] = await Promise.all([
    listAlerts(status === 'READ' ? { status: 'READ' } : undefined),
    getLocallyResolvedAlertIds(),
  ]);
  const locallyResolved = new Set(locallyResolvedIds);
  const normalizedAlerts = alerts.map((alert) =>
    locallyResolved.has(alert.id)
      ? {
          ...alert,
          status: 'READ' as const,
          statusLabel: 'Lido',
          canonicalStatus: 'READ' as const,
          severity: 'LOW' as const,
          severityRank: 0,
          readState: 'READ_STATE' as const,
        }
      : alert
  );
  if (status === 'ALL') return normalizedAlerts;
  return normalizedAlerts.filter((alert) => alert.status === status);
}

export async function getAlarmById(id: string): Promise<AlarmItem | null> {
  if (process.env.EXPO_PUBLIC_USE_MOCKS === 'true') return null;
  const response = await api.get(`/api/v1/alerts/${id}`);
  return normalizeAlert(response.data);
}

export async function getAlarmSummary() {
  const alerts = await listAlerts();
  const latestAlert = alerts[0] || null;

  return {
    unauthorized: alerts.filter((alert) => alert.status === 'UNREAD' && alert.severity === 'CRITICAL').length,
    underReview: alerts.filter((alert) => alert.status === 'UNREAD' && alert.severity !== 'CRITICAL').length,
    latestDetectedAt: latestAlert?.detectedAt || '--',
    latestTitle: latestAlert?.title || null,
    latestLocation: latestAlert?.location || null,
    latestTypeLabel: latestAlert?.typeLabel || null,
  };
}

export async function getWeeklyStats(): Promise<WeeklyStat[]> {
  const alerts = await listAlerts();
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const counts = labels.map((day) => ({ day, count: 0 }));

  alerts.forEach((alert) => {
    const date = new Date(alert.detectedAt);
    if (!Number.isNaN(date.getTime())) {
      counts[date.getDay()].count += 1;
    }
  });

  return [counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]];
}
