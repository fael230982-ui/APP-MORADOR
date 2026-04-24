import api, { resolveApiUrl } from './api';
import { useAuthStore } from '../store/useAuthStore';
import type { MinorFacialAuthorization, Person, PersonAccessSummary } from '../types/person';

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function normalizePerson(raw: any): Person {
  return {
    id: String(raw?.id ?? ''),
    name: String(raw?.name ?? 'Pessoa'),
    category: raw?.category ?? 'VISITOR',
    categoryLabel: raw?.categoryLabel ?? raw?.category ?? 'Pessoa',
    status: raw?.status ?? 'ACTIVE',
    statusLabel: raw?.statusLabel ?? raw?.status ?? 'Ativo',
    photoUrl: resolveApiUrl(raw?.photoUrl ?? null),
    unitId: raw?.unitId ?? null,
    unitName: raw?.unitName ?? null,
    unitIds: raw?.unitIds ?? [],
    unitNames: raw?.unitNames ?? [],
    accessGroupIds: raw?.accessGroupIds ?? [],
    accessGroupNames: raw?.accessGroupNames ?? [],
    phone: raw?.phone ?? null,
    email: raw?.email ?? null,
    document: raw?.document ?? raw?.cpf ?? null,
    documentType: raw?.documentType ?? null,
    birthDate: raw?.birthDate ?? null,
    startDate: raw?.startDate ?? null,
    endDate: raw?.endDate ?? null,
    notes: raw?.notes ?? raw?.observations ?? null,
    serviceType: raw?.serviceType ?? raw?.service ?? null,
    serviceCompany: raw?.serviceCompany ?? null,
    vehiclePlate: raw?.vehiclePlate ?? raw?.plate ?? null,
    authorizedWeekdays: raw?.authorizedWeekdays ?? [],
    accessStartTime: raw?.accessStartTime ?? null,
    accessEndTime: raw?.accessEndTime ?? null,
    minorFacialAuthorization:
      raw?.minorFacialAuthorization && typeof raw.minorFacialAuthorization === 'object'
        ? {
            authorized: raw.minorFacialAuthorization?.authorized === true,
            guardianName: raw.minorFacialAuthorization?.guardianName ?? null,
            guardianDocument: raw.minorFacialAuthorization?.guardianDocument ?? null,
            relationship: raw.minorFacialAuthorization?.relationship ?? null,
            authorizationSource: raw.minorFacialAuthorization?.authorizationSource ?? null,
            authorizedAt: raw.minorFacialAuthorization?.authorizedAt ?? null,
            notes: raw.minorFacialAuthorization?.notes ?? null,
          }
        : null,
  };
}

const mockPersons: Person[] = [
  {
    id: 'mock-1',
    name: 'Rafael Bezerra',
    category: 'RESIDENT',
    categoryLabel: 'Morador',
    status: 'ACTIVE',
    statusLabel: 'Ativo',
  },
];

function getEffectiveSelectedUnitId() {
  const { selectedUnitId, user } = useAuthStore.getState();
  return (
    selectedUnitId ??
    user?.selectedUnitId ??
    user?.unitId ??
    (user?.unitIds && user.unitIds.length === 1 ? user.unitIds[0] : null)
  );
}

function keepSelectedUnitPersons(persons: Person[], selectedUnitId?: string | null) {
  if (!selectedUnitId) return persons;

  const personsWithUnit = persons.filter((person) => person.unitId || (Array.isArray(person.unitIds) && person.unitIds.length > 0));
  if (personsWithUnit.length === 0) return persons;

  return personsWithUnit.filter((person) => {
    if (person.unitId && person.unitId === selectedUnitId) return true;
    if (Array.isArray(person.unitIds) && person.unitIds.includes(selectedUnitId)) return true;
    return false;
  });
}

export async function getPersons(category?: string): Promise<Person[]> {
  if (process.env.EXPO_PUBLIC_USE_MOCKS === 'true') {
    return category && category !== 'ALL'
      ? mockPersons.filter((person) => person.category === category)
      : mockPersons;
  }

  const effectiveUnitId = getEffectiveSelectedUnitId();

  const response = await api.get('/api/v1/people', {
    params: {
      limit: 100,
      category: category && category !== 'ALL' ? category : undefined,
      unitId: effectiveUnitId || undefined,
    },
  });

  return keepSelectedUnitPersons(
    extractItems(response.data).map(normalizePerson).filter((person) => person.id),
    effectiveUnitId
  );
}

export async function getPersonById(id: string): Promise<Person | null> {
  if (process.env.EXPO_PUBLIC_USE_MOCKS === 'true') {
    return mockPersons.find((person) => person.id === id) ?? null;
  }

  const response = await api.get(`/api/v1/people/${id}`);
  return normalizePerson(response.data);
}

function normalizeAccessSummary(raw: any): PersonAccessSummary {
  return {
    personId: String(raw?.personId ?? ''),
    personName: raw?.personName ?? null,
    totalAccesses: Number(raw?.totalAccesses ?? 0),
    entries: Number(raw?.entries ?? 0),
    exits: Number(raw?.exits ?? 0),
    denied: Number(raw?.denied ?? 0),
    lastAccessAt: raw?.lastAccessAt ?? null,
    lastDirection: raw?.lastDirection ?? null,
    lastResult: raw?.lastResult ?? null,
    lastEntryAt: raw?.lastEntryAt ?? null,
    lastExitAt: raw?.lastExitAt ?? null,
    isInsideNow: !!raw?.isInsideNow,
    accessesToday: Number(raw?.accessesToday ?? 0),
    operatorUserName: raw?.operatorUserName ?? raw?.lastOperatorName ?? null,
    cameraName: raw?.cameraName ?? raw?.lastCameraName ?? null,
    location: raw?.location ?? raw?.lastLocation ?? null,
  };
}

export async function getPersonAccessSummary(id: string): Promise<PersonAccessSummary | null> {
  try {
    const response = await api.get(`/api/v1/people/${id}/access-summary`);
    const summary = normalizeAccessSummary(response.data);
    return summary.personId ? summary : null;
  } catch (err: any) {
    if ([403, 404].includes(err?.response?.status)) return null;
    throw err;
  }
}

export type SavePersonPayload = {
  name: string;
  email?: string | null;
  document?: string | null;
  documentType?: 'CPF' | 'RG' | 'CNH' | null;
  birthDate?: string | null;
  category: Person['category'];
  photoUrl?: string | null;
  phone?: string | null;
  unitId?: string | null;
  unitIds?: string[];
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  serviceType?: string | null;
  serviceCompany?: string | null;
  vehiclePlate?: string | null;
  authorizedWeekdays?: string[];
  accessStartTime?: string | null;
  accessEndTime?: string | null;
  accessGroupIds?: string[];
  minorFacialAuthorization?: MinorFacialAuthorization | null;
};

export async function createPerson(payload: SavePersonPayload): Promise<Person> {
  const response = await api.post('/api/v1/people', payload);
  return normalizePerson(response.data);
}

export async function updatePerson(id: string, payload: Partial<SavePersonPayload>): Promise<Person> {
  const response = await api.patch(`/api/v1/people/${id}`, payload);
  return normalizePerson(response.data);
}

export async function updatePersonStatus(id: string, status: Person['status']): Promise<Person> {
  const response = await api.patch(`/api/v1/people/${id}/status`, { status });
  return normalizePerson(response.data);
}

export async function searchPersons(term: string, category?: string): Promise<Person[]> {
  const normalized = term.trim().toLowerCase();
  const persons = await getPersons(category);

  if (!normalized) return persons;

  return persons.filter((person) => (
    person.name.toLowerCase().includes(normalized) ||
    person.id.toLowerCase().includes(normalized) ||
    person.categoryLabel.toLowerCase().includes(normalized) ||
    person.statusLabel.toLowerCase().includes(normalized)
  ));
}

export type VisitForecastPayload = {
  unitId?: string | null;
  residentUserId?: string | null;
  visitorName: string;
  visitorDocument?: string | null;
  visitorPhone?: string | null;
  category: Person['category'];
  notes?: string | null;
  expectedEntryAt: string;
  expectedExitAt: string;
  birthDate?: string | null;
  minorFacialAuthorization?: MinorFacialAuthorization | null;
};

export async function createVisitForecast(payload: VisitForecastPayload) {
  const response = await api.post('/api/v1/visit-forecasts', payload);
  return response.data;
}
