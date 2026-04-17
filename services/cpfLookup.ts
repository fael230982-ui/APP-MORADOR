import api from './api';
import { appDiagnostics } from './appDiagnostics';

export type CpfLookupResult = {
  fullName: string | null;
  birthDate: string | null;
};

const LOOKUP_ENDPOINT = '/api/v1/resident/people/by-cpf';

function normalizeBirthDate(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split('/');
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

function normalizeLookupPayload(raw: any): CpfLookupResult | null {
  const source = raw?.data ?? raw?.result ?? raw;
  const fullName = source?.fullName ?? source?.name ?? source?.nomeCompleto ?? source?.nome ?? null;
  const birthDate = normalizeBirthDate(source?.birthDate ?? source?.dateOfBirth ?? source?.dataNascimento);

  if (!fullName && !birthDate) return null;

  return {
    fullName: typeof fullName === 'string' ? fullName.trim() || null : null,
    birthDate,
  };
}

function normalizeCpf(value: string) {
  return value.replace(/\D/g, '');
}

export async function lookupCpfProfile(cpf: string): Promise<CpfLookupResult | null> {
  const normalizedCpf = normalizeCpf(cpf);
  if (normalizedCpf.length !== 11) return null;

  try {
    const response = await api.get(LOOKUP_ENDPOINT, {
      params: { cpf: normalizedCpf },
    });

    return normalizeLookupPayload(response.data);
  } catch (err: any) {
    const status = err?.response?.status;
    if ([400, 403, 404, 405].includes(status)) return null;
    appDiagnostics.trackError('cpf.lookup', err, 'Falha na consulta canonica por CPF').catch(() => undefined);
    throw err;
  }
}
