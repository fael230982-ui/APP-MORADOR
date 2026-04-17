import api from './api';

export type ResidentLiveIncident = {
  id: string;
  type: 'PANIC' | 'ARRIVAL_MONITORING';
  status: 'ACTIVE' | 'NOTIFIED_OPERATION' | 'RESOLVED' | 'CANCELLED';
  alertId: string | null;
  residentName: string;
  residentPhone: string | null;
  unitId: string;
  unitName: string | null;
  condominiumId: string;
  condominiumName: string | null;
  operationNotified: boolean;
  operationNotifiedAt: string | null;
  notificationRadiusMeters: number;
  distanceToCondominiumMeters: number | null;
  latestLocation: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
    recordedAt: string;
  } | null;
  unitContacts: Array<{
    userId: string;
    personId: string | null;
    name: string;
    phone: string | null;
  }>;
  createdAt: string;
  updatedAt: string | null;
  stoppedAt: string | null;
  stoppedReason: string | null;
};

export function normalizeResidentLiveIncident(raw: any): ResidentLiveIncident | null {
  const source = raw?.data ?? raw;
  if (!source?.id || !source?.type || !source?.unitId || !source?.condominiumId) return null;

  return {
    id: String(source.id),
    type: String(source.type).toUpperCase() === 'ARRIVAL_MONITORING' ? 'ARRIVAL_MONITORING' : 'PANIC',
    status: ['NOTIFIED_OPERATION', 'RESOLVED', 'CANCELLED'].includes(String(source?.status).toUpperCase())
      ? (String(source.status).toUpperCase() as ResidentLiveIncident['status'])
      : 'ACTIVE',
    alertId: source?.alertId ? String(source.alertId) : null,
    residentName: String(source?.residentName ?? 'Morador'),
    residentPhone: source?.residentPhone ? String(source.residentPhone) : null,
    unitId: String(source.unitId),
    unitName: source?.unitName ? String(source.unitName) : null,
    condominiumId: String(source.condominiumId),
    condominiumName: source?.condominiumName ? String(source.condominiumName) : null,
    operationNotified: source?.operationNotified === true,
    operationNotifiedAt: source?.operationNotifiedAt ? String(source.operationNotifiedAt) : null,
    notificationRadiusMeters: Number(source?.notificationRadiusMeters ?? 0),
    distanceToCondominiumMeters:
      source?.distanceToCondominiumMeters === null || source?.distanceToCondominiumMeters === undefined
        ? null
        : Number(source.distanceToCondominiumMeters),
    latestLocation: source?.latestLocation
      ? {
          latitude: Number(source.latestLocation.latitude),
          longitude: Number(source.latestLocation.longitude),
          accuracy: source.latestLocation.accuracy ?? null,
          speed: source.latestLocation.speed ?? null,
          heading: source.latestLocation.heading ?? null,
          recordedAt: String(source.latestLocation.recordedAt),
        }
      : null,
    unitContacts: Array.isArray(source?.unitContacts)
      ? source.unitContacts.map((item: any) => ({
          userId: String(item?.userId ?? ''),
          personId: item?.personId ? String(item.personId) : null,
          name: String(item?.name ?? 'Contato'),
          phone: item?.phone ? String(item.phone) : null,
        }))
      : [],
    createdAt: String(source.createdAt),
    updatedAt: source?.updatedAt ? String(source.updatedAt) : null,
    stoppedAt: source?.stoppedAt ? String(source.stoppedAt) : null,
    stoppedReason: source?.stoppedReason ? String(source.stoppedReason) : null,
  };
}

function normalizeIncidentList(raw: any): ResidentLiveIncident[] {
  const source = raw?.data ?? raw;
  const items = Array.isArray(source) ? source : Array.isArray(source?.items) ? source.items : [];
  return items.map(normalizeResidentLiveIncident).filter(Boolean) as ResidentLiveIncident[];
}

export async function getActiveResidentLiveIncidents(): Promise<ResidentLiveIncident[]> {
  try {
    const response = await api.get('/api/v1/resident/live-incidents/active');
    return normalizeIncidentList(response.data);
  } catch (err: any) {
    const status = err?.response?.status;
    if ([403, 404, 405].includes(status)) return [];
    throw err;
  }
}

export async function getResidentLiveIncidentHistory(limit = 10): Promise<ResidentLiveIncident[]> {
  try {
    const response = await api.get('/api/v1/resident/live-incidents/history', {
      params: { limit },
    });
    return normalizeIncidentList(response.data);
  } catch (err: any) {
    const status = err?.response?.status;
    if ([403, 404, 405].includes(status)) return [];
    throw err;
  }
}
