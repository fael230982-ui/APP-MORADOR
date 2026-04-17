import api from './api';
import { getResidentDeviceId } from './deviceIdentity';

export type ResidentLgpdHistoryRecord = {
  version: string;
  accepted: boolean;
  acceptedAt: string | null;
  revokedAt: string | null;
  scopeType: string | null;
  deviceId: string | null;
};

function normalizeRecord(raw: any): ResidentLgpdHistoryRecord | null {
  const source = raw?.data ?? raw;
  if (!source?.version) return null;

  return {
    version: String(source.version),
    accepted: source?.accepted !== false,
    acceptedAt: source?.acceptedAt ? String(source.acceptedAt) : null,
    revokedAt: source?.revokedAt ? String(source.revokedAt) : null,
    scopeType: source?.scopeType ? String(source.scopeType) : null,
    deviceId: source?.deviceId ? String(source.deviceId) : null,
  };
}

export async function getResidentLgpdConsentHistory(): Promise<ResidentLgpdHistoryRecord[]> {
  try {
    const deviceId = await getResidentDeviceId();
    const response = await api.get('/api/v1/resident/lgpd-consent/history', {
      params: { deviceId },
    });

    const source = response.data?.data ?? response.data;
    const items = Array.isArray(source) ? source : Array.isArray(source?.items) ? source.items : [];
    return items.map(normalizeRecord).filter(Boolean) as ResidentLgpdHistoryRecord[];
  } catch (err: any) {
    const status = err?.response?.status;
    if ([400, 403, 404, 405].includes(status)) return [];
    throw err;
  }
}
