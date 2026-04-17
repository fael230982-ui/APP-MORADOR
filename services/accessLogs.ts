import api from './api';
import { useAuthStore } from '../store/useAuthStore';

export type AccessLog = {
  id: string;
  personId?: string | null;
  personName?: string | null;
  cameraName?: string | null;
  userName?: string | null;
  classification: string;
  classificationLabel: string;
  direction: 'ENTRY' | 'EXIT' | string;
  result: 'ALLOWED' | 'DENIED' | string;
  location?: string | null;
  message?: string | null;
  timestamp: string;
};

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function normalizeAccessLog(raw: any): AccessLog {
  return {
    id: String(raw?.id ?? ''),
    personId: raw?.personId ?? null,
    personName: raw?.personName ?? null,
    cameraName: raw?.cameraName ?? null,
    userName: raw?.userName ?? null,
    classification: String(raw?.classification ?? ''),
    classificationLabel: String(raw?.classificationLabel ?? raw?.classification ?? 'Acesso'),
    direction: String(raw?.direction ?? 'ENTRY'),
    result: String(raw?.result ?? 'ALLOWED'),
    location: raw?.location ?? null,
    message: raw?.message ?? null,
    timestamp: raw?.timestamp ?? raw?.createdAt ?? '',
  };
}

export async function listAccessLogs(limit = 20): Promise<AccessLog[]> {
  const selectedUnitId = useAuthStore.getState().selectedUnitId;
  const response = await api.get('/api/v1/access-logs', {
    params: { page: 1, limit, unitId: selectedUnitId || undefined },
  });

  return extractItems(response.data).map(normalizeAccessLog).filter((item) => item.id);
}
