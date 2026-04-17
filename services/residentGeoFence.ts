import api from './api';
import { RESIDENT_OPERATION_GEOFENCE } from '../constants/residentOperations';

export type ResidentGeoFence = {
  unitId: string | null;
  condominiumId: string | null;
  centerLatitude: number | null;
  centerLongitude: number | null;
  notificationRadiusMeters: number | null;
  panicRadiusMeters: number | null;
  assistedDispatchRadiusMeters: number;
};

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeGeoFence(raw: any): ResidentGeoFence | null {
  const source = raw?.data ?? raw;
  const centerLatitude = normalizeNumber(source?.centerLatitude);
  const centerLongitude = normalizeNumber(source?.centerLongitude);

  if (centerLatitude === null || centerLongitude === null) return null;

  const notificationRadiusMeters = normalizeNumber(source?.notificationRadiusMeters);

  return {
    unitId: source?.unitId ? String(source.unitId) : null,
    condominiumId: source?.condominiumId ? String(source.condominiumId) : null,
    centerLatitude,
    centerLongitude,
    notificationRadiusMeters,
    panicRadiusMeters: normalizeNumber(source?.panicRadiusMeters),
    assistedDispatchRadiusMeters:
      notificationRadiusMeters ??
      RESIDENT_OPERATION_GEOFENCE.assistedDispatchRadiusMeters,
  };
}

export async function getResidentGeoFence(): Promise<ResidentGeoFence | null> {
  try {
    const response = await api.get('/api/v1/resident/arrival-monitoring/geo-fence');
    return normalizeGeoFence(response.data);
  } catch (err: any) {
    const status = err?.response?.status;
    if ([400, 403, 404, 405].includes(status)) return null;
    throw err;
  }
}

