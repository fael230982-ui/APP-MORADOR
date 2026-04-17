import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, removeStorageItems, STORAGE_KEYS } from '../constants/storage';
import api from './api';
import { sendLocalNotification } from '../utils/notificationService';

const NOTIFIED_VISITS_KEY = STORAGE_KEYS.notifiedArrivedVisits;
const MAX_NOTIFIED_VISITS = 200;

export type VisitForecast = {
  id: string;
  unitId?: string | null;
  unitName?: string | null;
  visitorName: string;
  visitorDocument?: string | null;
  visitorPhone?: string | null;
  category: string;
  categoryLabel?: string | null;
  serviceType?: string | null;
  serviceCompany?: string | null;
  vehiclePlate?: string | null;
  notes?: string | null;
  expectedEntryAt?: string | null;
  expectedExitAt?: string | null;
  releaseMode?: string | null;
  status?: string | null;
  arrivedAt?: string | null;
  arrivedByUserName?: string | null;
  departedAt?: string | null;
  departedByUserName?: string | null;
  residentNotifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  events?: VisitForecastEvent[];
};

export type VisitForecastEvent = {
  id: string;
  eventType: string;
  actorUserName?: string | null;
  message?: string | null;
  createdAt?: string | null;
};

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function normalizeVisit(raw: any): VisitForecast {
  const rawStatus = String(raw?.status ?? '').toUpperCase();
  const normalizedStatus =
    rawStatus === 'SCHEDULED'
      ? 'PENDING_ARRIVAL'
      : rawStatus === 'COMPLETED'
        ? 'ARRIVED'
        : rawStatus === 'NO_SHOW'
          ? 'EXPIRED'
        : rawStatus || null;

  return {
    id: String(raw?.id ?? ''),
    unitId: raw?.unitId ?? null,
    unitName: raw?.unitName ?? null,
    visitorName: String(raw?.visitorName ?? raw?.name ?? 'Visitante'),
    visitorDocument: raw?.visitorDocument ?? raw?.document ?? null,
    visitorPhone: raw?.visitorPhone ?? raw?.phone ?? null,
    category: String(raw?.category ?? 'VISITOR'),
    categoryLabel: raw?.categoryLabel ?? raw?.category ?? null,
    serviceType: raw?.serviceType ?? null,
    serviceCompany: raw?.serviceCompany ?? null,
    vehiclePlate: raw?.vehiclePlate ?? raw?.plate ?? null,
    notes: raw?.notes ?? raw?.observations ?? null,
    expectedEntryAt: raw?.expectedEntryAt ?? raw?.scheduledEntryAt ?? raw?.startAt ?? null,
    expectedExitAt: raw?.expectedExitAt ?? raw?.scheduledExitAt ?? raw?.endAt ?? null,
    releaseMode: raw?.releaseMode ?? null,
    status: normalizedStatus,
    arrivedAt: raw?.arrivedAt ?? null,
    arrivedByUserName: raw?.arrivedByUserName ?? null,
    departedAt: raw?.departedAt ?? null,
    departedByUserName: raw?.departedByUserName ?? null,
    residentNotifiedAt: raw?.residentNotifiedAt ?? null,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
    events: Array.isArray(raw?.events)
      ? raw.events.map((event: any) => ({
          id: String(event?.id ?? ''),
          eventType: String(event?.eventType ?? 'UPDATED'),
          actorUserName: event?.actorUserName ?? null,
          message: event?.message ?? null,
          createdAt: event?.createdAt ?? null,
        })).filter((event: VisitForecastEvent) => event.id)
      : [],
  };
}

export async function listVisitForecasts(unitId?: string | null): Promise<VisitForecast[]> {
  const response = await api.get('/api/v1/visit-forecasts', {
    params: { page: 1, limit: 100, unitId: unitId || undefined },
  });

  return extractItems(response.data).map(normalizeVisit).filter((visit) => visit.id);
}

export async function getVisitForecast(id: string): Promise<VisitForecast> {
  const response = await api.get(`/api/v1/visit-forecasts/${id}`);
  return normalizeVisit(response.data);
}

export async function updateVisitForecastStatus(
  id: string,
  status: 'PENDING_ARRIVAL' | 'ARRIVED' | 'EXPIRED' | 'CANCELLED'
): Promise<VisitForecast> {
  const response = await api.patch(`/api/v1/visit-forecasts/${id}/status`, { status });
  return normalizeVisit(response.data);
}

async function getNotifiedVisitIds() {
  const data = await getStorageItemWithLegacy(NOTIFIED_VISITS_KEY, LEGACY_STORAGE_KEYS.notifiedArrivedVisits);
  return data ? (JSON.parse(data) as string[]) : [];
}

async function saveNotifiedVisitIds(ids: string[]) {
  await AsyncStorage.setItem(
    NOTIFIED_VISITS_KEY,
    JSON.stringify(Array.from(new Set(ids)).slice(-MAX_NOTIFIED_VISITS))
  );
}

export async function pruneNotifiedVisitIds(limit: number = MAX_NOTIFIED_VISITS) {
  const ids = await getNotifiedVisitIds();
  await saveNotifiedVisitIds(ids.slice(-Math.max(1, limit)));
}

export async function clearNotifiedVisitIds() {
  await removeStorageItems([NOTIFIED_VISITS_KEY, ...LEGACY_STORAGE_KEYS.notifiedArrivedVisits]);
}

export async function notifyArrivedVisits(unitId?: string | null) {
  if (!unitId) return;

  const [visits, notifiedIds] = await Promise.all([
    listVisitForecasts(unitId),
    getNotifiedVisitIds(),
  ]);

  const arrivedVisits = visits.filter((visit) => visit.arrivedAt && !notifiedIds.includes(visit.id));

  for (const visit of arrivedVisits) {
    await sendLocalNotification(
      'Visita chegou',
      `${visit.visitorName} teve o acesso validado na portaria.`,
      { type: 'VISIT_ARRIVED', visitId: visit.id },
      { profile: 'VISIT' }
    );
    notifiedIds.push(visit.id);
  }

  if (arrivedVisits.length > 0) {
    await saveNotifiedVisitIds(notifiedIds);
  }
}
