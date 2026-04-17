import { createPerson, getPersons, type SavePersonPayload } from './persons';

function mapLegacyType(type: 'PRESTADOR' | 'VISITANTE' | 'ALUGANTE'): SavePersonPayload['category'] {
  if (type === 'PRESTADOR') return 'SERVICE_PROVIDER';
  if (type === 'ALUGANTE') return 'RENTER';
  return 'VISITOR';
}

export const peopleService = {
  saveAuthorized: async (data: {
    name: string;
    type: 'PRESTADOR' | 'VISITANTE' | 'ALUGANTE';
    photoBase64?: string;
    days?: string[];
    startDate?: string;
    endDate?: string;
  }) => createPerson({
    name: data.name,
    category: mapLegacyType(data.type),
    startDate: data.startDate || null,
    endDate: data.endDate || null,
  }),

  getAccessHistory: async () => getPersons(),
};
