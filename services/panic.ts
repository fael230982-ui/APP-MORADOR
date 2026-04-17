import type { PanicEvent, PanicType } from '../types/panic';
import { RESIDENT_OPERATION_GEOFENCE } from '../constants/residentOperations';
import api from './api';
import { checkRadius, getCurrentResidentLocation, type ResidentLocationSnapshot } from './locationService';
import { getResidentGeoFence, type ResidentGeoFence } from './residentGeoFence';
import {
  getActiveResidentLiveIncidents,
  getResidentLiveIncidentHistory,
  normalizeResidentLiveIncident,
  type ResidentLiveIncident,
} from './residentLiveIncidents';

export type ResidentActionAvailability = {
  type: PanicType;
  actionId: string | null;
  published: boolean;
  available: boolean;
  reason: string | null;
};

type IncidentLocationPayload = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  recordedAt?: string | null;
};

type ResidentPanicStatus = {
  current: ResidentLocationSnapshot;
  panic: {
    distanceMeters: number | null;
    insideRadius: boolean;
    radiusMeters: number;
  };
  assistedEntry: {
    distanceMeters: number | null;
    insideRadius: boolean;
    radiusMeters: number;
  };
  centerConfigured: boolean;
  source: 'api' | 'env' | 'none';
  activeIncidents: ResidentLiveIncident[];
};

function toLocationPayload(location: ResidentLocationSnapshot): IncidentLocationPayload {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy ?? null,
    speed: null,
    heading: null,
    recordedAt: location.capturedAt,
  };
}

function getOfficialRoute(type: PanicType, mode: 'start' | 'location' | 'stop', id?: string) {
  if (type === 'ASSISTED_ENTRY') {
    if (mode === 'start') return '/api/v1/resident/arrival-monitoring/start';
    if (mode === 'location' && id) return `/api/v1/resident/arrival-monitoring/${encodeURIComponent(id)}/location`;
    if (mode === 'stop' && id) return `/api/v1/resident/arrival-monitoring/${encodeURIComponent(id)}/stop`;
  }

  if (mode === 'start') return '/api/v1/resident/panic/start';
  if (mode === 'location' && id) return `/api/v1/resident/panic/${encodeURIComponent(id)}/location`;
  return `/api/v1/resident/panic/${encodeURIComponent(String(id || ''))}/stop`;
}

function getGeoFenceCenter(geoFence: ResidentGeoFence | null) {
  if (geoFence?.centerLatitude !== null && geoFence?.centerLongitude !== null) {
    return {
      latitude: geoFence.centerLatitude,
      longitude: geoFence.centerLongitude,
      source: 'api' as const,
    };
  }

  if (RESIDENT_OPERATION_GEOFENCE.latitude !== null && RESIDENT_OPERATION_GEOFENCE.longitude !== null) {
    return {
      latitude: RESIDENT_OPERATION_GEOFENCE.latitude,
      longitude: RESIDENT_OPERATION_GEOFENCE.longitude,
      source: 'env' as const,
    };
  }

  return {
    latitude: null,
    longitude: null,
    source: 'none' as const,
  };
}

function getPanicRadius(geoFence: ResidentGeoFence | null) {
  return geoFence?.panicRadiusMeters ?? RESIDENT_OPERATION_GEOFENCE.panicRadiusMeters;
}

function getAssistedRadius(geoFence: ResidentGeoFence | null) {
  return geoFence?.assistedDispatchRadiusMeters ?? RESIDENT_OPERATION_GEOFENCE.assistedDispatchRadiusMeters;
}

function toHistoryItem(incident: ResidentLiveIncident): PanicEvent {
  const type: PanicType = incident.type === 'ARRIVAL_MONITORING' ? 'ASSISTED_ENTRY' : 'PANIC';

  let statusLabel = 'Enviado';
  if (incident.status === 'NOTIFIED_OPERATION') statusLabel = 'Portaria avisada';
  if (incident.status === 'RESOLVED') statusLabel = 'Encerrado';
  if (incident.status === 'CANCELLED') statusLabel = 'Cancelado';

  return {
    id: incident.id,
    type,
    typeLabel: type === 'ASSISTED_ENTRY' ? 'Entrada assistida' : 'Botão de pânico',
    createdAt: incident.createdAt,
    status: incident.status === 'RESOLVED' || incident.status === 'CANCELLED' ? 'RESOLVED' : 'OPEN',
    statusLabel,
    locationContext:
      incident.distanceToCondominiumMeters !== null &&
      incident.distanceToCondominiumMeters > RESIDENT_OPERATION_GEOFENCE.assistedDispatchRadiusMeters
        ? 'OUTSIDE'
        : 'INSIDE',
  };
}

async function startOfficialIncident(type: PanicType, location: ResidentLocationSnapshot) {
  const response = await api.post(getOfficialRoute(type, 'start'), toLocationPayload(location));
  const items = Array.isArray(response.data?.data) ? response.data.data : [response.data];
  const directIncident = items.map(normalizeResidentLiveIncident).find(Boolean) ?? null;
  if (directIncident) return directIncident;

  const incidentId = items.map((item: any) => item?.data?.id ?? item?.id).find(Boolean);
  if (!incidentId) return null;

  return (await getActiveResidentLiveIncidents()).find((item) => item.id === String(incidentId)) ?? null;
}

async function resolveGeoFenceStatus(current: ResidentLocationSnapshot) {
  const geoFence = await getResidentGeoFence().catch(() => null);
  const center = getGeoFenceCenter(geoFence);
  const panicRadius = getPanicRadius(geoFence);
  const assistedRadius = getAssistedRadius(geoFence);

  return {
    centerConfigured: center.latitude !== null && center.longitude !== null,
    source: center.source,
    panicRadius,
    assistedRadius,
    panic: checkRadius(current, center, panicRadius),
    assistedEntry: checkRadius(current, center, assistedRadius),
  };
}

export async function updateResidentIncidentLocation(type: PanicType, incidentId: string, location?: ResidentLocationSnapshot) {
  const snapshot = location ?? (await getCurrentResidentLocation());
  const response = await api.patch(getOfficialRoute(type, 'location', incidentId), toLocationPayload(snapshot));
  const items = Array.isArray(response.data?.data) ? response.data.data : [response.data];
  const directIncident = items.map(normalizeResidentLiveIncident).find(Boolean) ?? null;
  if (directIncident) return directIncident;

  const updatedId = items.map((item: any) => item?.data?.id ?? item?.id).find(Boolean);
  return updatedId
    ? (await getActiveResidentLiveIncidents()).find((item) => item.id === String(updatedId)) ?? null
    : null;
}

export async function stopResidentIncident(type: PanicType, incidentId: string, reason?: string | null) {
  const response = await api.post(getOfficialRoute(type, 'stop', incidentId), {
    reason: reason?.trim() || null,
  });
  const items = Array.isArray(response.data?.data) ? response.data.data : [response.data];
  const directIncident = items.map(normalizeResidentLiveIncident).find(Boolean) ?? null;
  if (directIncident) return directIncident;

  const stoppedId = items.map((item: any) => item?.data?.id ?? item?.id).find(Boolean);
  if (!stoppedId) return null;

  const history = await getResidentLiveIncidentHistory(20);
  return history.find((item) => item.id === String(stoppedId)) ?? null;
}

export async function getPanicStatus(): Promise<ResidentPanicStatus> {
  const current = await getCurrentResidentLocation();
  const [status, activeIncidents] = await Promise.all([
    resolveGeoFenceStatus(current),
    getActiveResidentLiveIncidents().catch(() => []),
  ]);

  return {
    current,
    panic: {
      ...status.panic,
      radiusMeters: status.panicRadius,
    },
    assistedEntry: {
      ...status.assistedEntry,
      radiusMeters: status.assistedRadius,
    },
    centerConfigured: status.centerConfigured,
    source: status.source,
    activeIncidents,
  };
}

export async function getResidentActionAvailability(): Promise<ResidentActionAvailability[]> {
  return [
    {
      type: 'PANIC',
      actionId: 'resident_panic',
      published: true,
      available: true,
      reason: null,
    },
    {
      type: 'ASSISTED_ENTRY',
      actionId: 'resident_arrival_monitoring',
      published: true,
      available: true,
      reason: null,
    },
  ];
}

export async function getPanicHistory(limit = 10): Promise<PanicEvent[]> {
  const history = await getResidentLiveIncidentHistory(limit);
  return history.map(toHistoryItem);
}

export async function triggerPanic(type: PanicType): Promise<PanicEvent> {
  const location = await getCurrentResidentLocation();
  const geoFenceStatus = await resolveGeoFenceStatus(location);

  if (type === 'ASSISTED_ENTRY' && geoFenceStatus.centerConfigured && !geoFenceStatus.assistedEntry.insideRadius) {
    throw new Error(
      `A entrada assistida só pode ser enviada quando você estiver a até ${geoFenceStatus.assistedRadius} m do condomínio.`
    );
  }

  if (type !== 'ASSISTED_ENTRY' && geoFenceStatus.centerConfigured && !geoFenceStatus.panic.insideRadius) {
    throw new Error(
      `O botão de pânico só pode ser acionado dentro do raio protegido do condomínio (${geoFenceStatus.panicRadius} m).`
    );
  }

  const incident = await startOfficialIncident(type, location);
  if (!incident) {
    throw new Error(
      type === 'ASSISTED_ENTRY'
        ? 'O backend não confirmou a abertura da entrada assistida.'
        : 'O backend não confirmou a abertura do alerta de pânico.'
    );
  }

  return toHistoryItem(incident);
}
