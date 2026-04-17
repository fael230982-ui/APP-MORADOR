import api from './api';

export type UnitResidentOption = {
  id: string;
  name: string;
  unitId: string;
  unitName: string | null;
};

function normalizeUnitResident(raw: any): UnitResidentOption | null {
  const id = raw?.id ? String(raw.id) : '';
  const name = raw?.name ? String(raw.name) : '';
  const unitId = raw?.unitId ? String(raw.unitId) : '';

  if (!id || !name || !unitId) return null;

  return {
    id,
    name,
    unitId,
    unitName: raw?.unitName ? String(raw.unitName) : null,
  };
}

export async function listUnitResidents(unitId: string): Promise<UnitResidentOption[]> {
  try {
    const response = await api.get('/api/v1/people/unit-residents', {
      params: { unitId },
    });

    const items = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

    return items
      .map(normalizeUnitResident)
      .filter((item): item is UnitResidentOption => !!item);
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 403 || status === 404 || status === 405) {
      return [];
    }
    throw err;
  }
}
