import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, removeStorageItems, STORAGE_KEYS } from '../constants/storage';
import { createPerson, getPersons, updatePersonStatus } from '../services/persons';
import { useAuthStore } from '../store/useAuthStore';
import type { Person } from '../types/person';

export interface PersonRecord {
  id: string;
  cpf?: string;
  name: string;
  email?: string;
  phone: string;
  type: 'MORADOR' | 'PRESTADOR' | 'VISITANTE' | 'ALUGANTE';
  service?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  photoUri?: string;
  observations?: string;
  morador: string;
  unidade: string;
  status: 'ATIVO' | 'EXPIRADO' | 'REATIVADO' | 'INATIVO';
  createdAt: string;
  updatedAt: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  deactivationReason?: string;
  editHistory: EditHistoryEntry[];
}

export interface EditHistoryEntry {
  timestamp: string;
  changedBy: string;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

const STORAGE_KEY = STORAGE_KEYS.peopleRegistry;
const MOCK_PEOPLE_RETENTION_DAYS = 180;
const MAX_EDIT_HISTORY_ENTRIES = 20;
const useMocks = () => process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

const generateId = (): string =>
  `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

function parseBrazilianDate(value?: string) {
  if (!value) return null;
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) return null;
  return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
}

function mapRecordType(type: PersonRecord['type']): Person['category'] {
  if (type === 'MORADOR') return 'RESIDENT';
  if (type === 'PRESTADOR') return 'SERVICE_PROVIDER';
  if (type === 'ALUGANTE') return 'RENTER';
  return 'VISITOR';
}

function mapApiPerson(person: Person): PersonRecord {
  const now = new Date().toISOString();
  return {
    id: person.id,
    cpf: person.document || undefined,
    name: person.name,
    email: person.email || undefined,
    phone: person.phone || '',
    type: person.category === 'RESIDENT'
      ? 'MORADOR'
      : person.category === 'SERVICE_PROVIDER'
        ? 'PRESTADOR'
        : person.category === 'RENTER'
          ? 'ALUGANTE'
          : 'VISITANTE',
    startDate: person.startDate || now,
    endDate: person.endDate || undefined,
    photoUri: person.photoUrl || undefined,
    morador: '',
    unidade: person.unitName || person.unitNames?.[0] || '',
    status: person.status === 'ACTIVE' ? 'ATIVO' : person.status === 'EXPIRED' ? 'EXPIRADO' : 'INATIVO',
    createdAt: now,
    updatedAt: now,
    editHistory: [],
  };
}

function isValidIsoDate(value?: string) {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function trimEditHistory(history?: EditHistoryEntry[]) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_EDIT_HISTORY_ENTRIES);
}

async function readStoredPeople(): Promise<PersonRecord[]> {
  const data = await getStorageItemWithLegacy(STORAGE_KEY, LEGACY_STORAGE_KEYS.peopleRegistry);
  return data ? (JSON.parse(data) as PersonRecord[]) : [];
}

async function writeStoredPeople(people: PersonRecord[]) {
  const normalized = people.map((person) => ({
    ...person,
    editHistory: trimEditHistory(person.editHistory),
  }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

export async function pruneMockPeopleRegistry(daysOld: number = MOCK_PEOPLE_RETENTION_DAYS) {
  if (!useMocks()) return;

  const people = await readStoredPeople();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - Math.max(1, daysOld));

  const filtered = people.filter((person) => {
    const normalizedStatus = String(person.status || '').toUpperCase();
    const isInactive = normalizedStatus === 'INATIVO' || normalizedStatus === 'EXPIRADO';
    if (!isInactive) return true;

    const referenceDate =
      person.deactivatedAt ||
      person.updatedAt ||
      person.endDate ||
      person.createdAt;

    if (!referenceDate) return true;

    const parsedDate = isValidIsoDate(referenceDate)
      ? new Date(referenceDate)
      : parseBrazilianDate(referenceDate);

    if (!parsedDate || Number.isNaN(parsedDate.getTime())) return true;
    return parsedDate >= cutoffDate;
  });

  if (filtered.length !== people.length || filtered.some((person, index) => person.editHistory?.length !== people[index]?.editHistory?.length)) {
    await writeStoredPeople(filtered);
    return;
  }

  await writeStoredPeople(filtered);
}

export async function clearMockPeopleRegistry() {
  if (!useMocks()) return;
  await removeStorageItems([STORAGE_KEY, ...LEGACY_STORAGE_KEYS.peopleRegistry]);
}

export const getAllPeople = async (): Promise<PersonRecord[]> => {
  if (!useMocks()) {
    const people = await getPersons();
    return people.map(mapApiPerson);
  }

  try {
    return await readStoredPeople();
  } catch (error) {
    console.error('Erro ao obter pessoas:', error);
    return [];
  }
};

export const getPersonById = async (id: string): Promise<PersonRecord | null> => {
  if (!useMocks()) {
    const people = await getAllPeople();
    return people.find((p) => p.id === id) || null;
  }

  try {
    const people = await getAllPeople();
    return people.find((p) => p.id === id) || null;
  } catch (error) {
    console.error('Erro ao buscar pessoa:', error);
    return null;
  }
};

export const searchByCPF = async (cpf: string): Promise<PersonRecord | null> => {
  if (!useMocks()) {
    const normalizedCpf = cpf.replace(/\D/g, '');
    const people = await getAllPeople();
    return people.find((p) => p.cpf?.replace(/\D/g, '') === normalizedCpf && p.status !== 'INATIVO') || null;
  }

  try {
    const people = await getAllPeople();
    return people.find((p) => p.cpf === cpf && p.status !== 'INATIVO') || null;
  } catch (error) {
    console.error('Erro ao buscar CPF:', error);
    return null;
  }
};

export const savePerson = async (
  data: Omit<PersonRecord, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'editHistory'>
): Promise<PersonRecord> => {
  if (!useMocks()) {
    const selectedUnitId = useAuthStore.getState().selectedUnitId;
    const created = await createPerson({
      name: data.name,
      email: data.email || null,
      document: data.cpf || null,
      documentType: data.cpf ? 'CPF' : null,
      category: mapRecordType(data.type),
      photoUrl: data.photoUri?.startsWith('http') ? data.photoUri : null,
      phone: data.phone || null,
      unitId: selectedUnitId,
      unitIds: selectedUnitId ? [selectedUnitId] : [],
      startDate: parseBrazilianDate(data.startDate),
      endDate: parseBrazilianDate(data.endDate),
    });

    return mapApiPerson(created);
  }

  try {
    const people = await getAllPeople();
    const now = new Date().toISOString();

    if (data.cpf) {
      const existing = people.find(
        (p) => p.cpf === data.cpf && p.status !== 'INATIVO'
      );
      if (existing) {
        throw new Error('CPF já cadastrado e ativo');
      }
    }

    const startDate = new Date(data.startDate.split('/').reverse().join('-'));
    const endDate = data.endDate
      ? new Date(data.endDate.split('/').reverse().join('-'))
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let status: 'ATIVO' | 'EXPIRADO' = 'ATIVO';
    if (endDate && endDate < today) {
      status = 'EXPIRADO';
    }

    const newPerson: PersonRecord = {
      id: generateId(),
      ...data,
      status,
      createdAt: now,
      updatedAt: now,
      editHistory: [
        {
          timestamp: now,
          changedBy: 'SISTEMA',
          changes: [
            {
              field: 'status',
              oldValue: 'N/A',
              newValue: status,
            },
          ],
        },
      ],
    };

    people.push(newPerson);
    await writeStoredPeople(people);
    return newPerson;
  } catch (error) {
    console.error('Erro ao salvar pessoa:', error);
    throw error;
  }
};

export const reactivatePerson = async (
  id: string,
  updates: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    photoUri?: string;
  },
  changedBy: string = 'SISTEMA'
): Promise<PersonRecord> => {
  if (!useMocks()) {
    const updated = await updatePersonStatus(id, 'ACTIVE');
    return mapApiPerson(updated);
  }

  try {
    const people = await getAllPeople();
    const personIndex = people.findIndex((p) => p.id === id);

    if (personIndex === -1) {
      throw new Error('Pessoa não encontrada');
    }

    const person = people[personIndex];
    const now = new Date().toISOString();

    const startDate = updates.startDate || person.startDate;
    const endDate = updates.endDate || person.endDate;
    const endDateObj = endDate
      ? new Date(endDate.split('/').reverse().join('-'))
      : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStatus: 'ATIVO' | 'EXPIRADO' | 'REATIVADO' = 'REATIVADO';
    if (endDateObj && endDateObj < today) {
      newStatus = 'EXPIRADO';
    }

    const changes: EditHistoryEntry['changes'] = [];

    if (updates.startDate && updates.startDate !== person.startDate) {
      changes.push({
        field: 'startDate',
        oldValue: person.startDate,
        newValue: updates.startDate,
      });
    }

    if (updates.endDate && updates.endDate !== person.endDate) {
      changes.push({
        field: 'endDate',
        oldValue: person.endDate || 'N/A',
        newValue: updates.endDate,
      });
    }

    if (updates.photoUri && updates.photoUri !== person.photoUri) {
      changes.push({
        field: 'photoUri',
        oldValue: person.photoUri ? 'foto_anterior' : 'N/A',
        newValue: 'foto_nova',
      });
    }

    if (newStatus !== person.status) {
      changes.push({
        field: 'status',
        oldValue: person.status,
        newValue: newStatus,
      });
    }

    const currentHistory = Array.isArray(person.editHistory)
      ? person.editHistory
      : [];

    const updatedPerson: PersonRecord = {
      ...person,
      ...updates,
      status: newStatus,
      updatedAt: now,
      editHistory: [
        ...currentHistory,
        {
          timestamp: now,
          changedBy,
          changes,
        },
      ],
    };

    people[personIndex] = updatedPerson;
    await writeStoredPeople(people);
    return updatedPerson;
  } catch (error) {
    console.error('Erro ao reativar pessoa:', error);
    throw error;
  }
};

export const deactivatePerson = async (
  id: string,
  reason: string = '',
  changedBy: string = 'SISTEMA'
): Promise<PersonRecord> => {
  if (!useMocks()) {
    const updated = await updatePersonStatus(id, 'INACTIVE');
    return mapApiPerson(updated);
  }

  try {
    const people = await getAllPeople();
    const personIndex = people.findIndex((p) => p.id === id);

    if (personIndex === -1) {
      throw new Error('Pessoa não encontrada');
    }

    const person = people[personIndex];
    const now = new Date().toISOString();

    const currentHistory = Array.isArray(person.editHistory)
      ? person.editHistory
      : [];

    const updatedPerson: PersonRecord = {
      ...person,
      status: 'INATIVO',
      deactivatedAt: now,
      deactivatedBy: changedBy,
      deactivationReason: reason,
      updatedAt: now,
      editHistory: [
        ...currentHistory,
        {
          timestamp: now,
          changedBy,
          changes: [
            {
              field: 'status',
              oldValue: person.status,
              newValue: 'INATIVO',
            },
            {
              field: 'deactivationReason',
              oldValue: 'N/A',
              newValue: reason || 'Sem motivo especificado',
            },
          ],
        },
      ],
    };

    people[personIndex] = updatedPerson;
    await writeStoredPeople(people);
    return updatedPerson;
  } catch (error) {
    console.error('Erro ao desativar pessoa:', error);
    throw error;
  }
};

export const editPerson = async (
  id: string,
  updates: Partial<
    Omit<PersonRecord, 'id' | 'createdAt' | 'status' | 'editHistory'>
  >,
  changedBy: string = 'SISTEMA'
): Promise<PersonRecord> => {
  try {
    const people = await getAllPeople();
    const personIndex = people.findIndex((p) => p.id === id);

    if (personIndex === -1) {
      throw new Error('Pessoa não encontrada');
    }

    const person = people[personIndex];
    const now = new Date().toISOString();

    const changes: EditHistoryEntry['changes'] = [];
    Object.entries(updates).forEach(([key, newValue]) => {
      const oldValue = (person as any)[key];
      if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue: oldValue ? String(oldValue) : 'N/A',
          newValue: newValue ? String(newValue) : 'N/A',
        });
      }
    });

    const currentHistory = Array.isArray(person.editHistory)
      ? person.editHistory
      : [];

    const updatedPerson: PersonRecord = {
      ...person,
      ...updates,
      updatedAt: now,
      editHistory: [
        ...currentHistory,
        {
          timestamp: now,
          changedBy,
          changes,
        },
      ],
    };

    people[personIndex] = updatedPerson;
    await writeStoredPeople(people);
    return updatedPerson;
  } catch (error) {
    console.error('Erro ao editar pessoa:', error);
    throw error;
  }
};

export const getPersonsByType = async (type: string): Promise<PersonRecord[]> => {
  try {
    const people = await getAllPeople();
    return people.filter((p) => p.type === type && p.status !== 'INATIVO');
  } catch (error) {
    console.error('Erro ao obter pessoas por tipo:', error);
    return [];
  }
};

export const getPersonsByStatus = async (status: string): Promise<PersonRecord[]> => {
  try {
    const people = await getAllPeople();
    return people.filter((p) => p.status === status);
  } catch (error) {
    console.error('Erro ao obter pessoas por status:', error);
    return [];
  }
};

export const getPersonsByMorador = async (morador: string): Promise<PersonRecord[]> => {
  try {
    const people = await getAllPeople();
    return people.filter((p) => p.morador === morador && p.status !== 'INATIVO');
  } catch (error) {
    console.error('Erro ao obter pessoas por morador:', error);
    return [];
  }
};

export const getPersonEditHistory = async (
  id: string
): Promise<EditHistoryEntry[]> => {
  try {
    const person = await getPersonById(id);
    return Array.isArray(person?.editHistory) ? person.editHistory : [];
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return [];
  }
};

export const exportToCsv = async (): Promise<string> => {
  try {
    const people = await getAllPeople();

    const headers = [
      'ID',
      'Nome',
      'CPF',
      'Telefone',
      'Email',
      'Tipo',
      'Serviço',
      'Data Início',
      'Data Fim',
      'Hora Entrada',
      'Hora Saída',
      'Unidade',
      'Morador',
      'Status',
      'Data Criação',
      'Data Atualização',
      'Observações',
    ];

    const rows = people.map((p) => [
      p.id,
      p.name,
      p.cpf || '',
      p.phone,
      p.email || '',
      p.type,
      p.service || '',
      p.startDate,
      p.endDate || '',
      p.startTime || '',
      p.endTime || '',
      p.unidade,
      p.morador,
      p.status,
      new Date(p.createdAt).toLocaleDateString('pt-BR'),
      new Date(p.updatedAt).toLocaleDateString('pt-BR'),
      p.observations || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw error;
  }
};

export const createBackup = async (): Promise<string> => {
  try {
    const people = await getAllPeople();
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: people,
    };
    return JSON.stringify(backup, null, 2);
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    throw error;
  }
};

export const restoreFromBackup = async (backupData: string): Promise<void> => {
  try {
    const backup = JSON.parse(backupData);
    if (!backup.data || !Array.isArray(backup.data)) {
      throw new Error('Formato de backup inválido');
    }
    await writeStoredPeople(backup.data);
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    throw error;
  }
};
