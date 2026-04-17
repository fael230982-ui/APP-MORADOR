import { useAuthStore } from '../store/useAuthStore';
import type { Vehicle, VehicleCreatePayload, VehicleStatus, VehicleType, VehicleUpdatePayload } from '../types/vehicle';
import api from './api';
import { emitAppRefresh } from '../utils/refreshBus';

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function normalizeVehicle(raw: any): Vehicle {
  return {
    id: String(raw?.id ?? ''),
    plate: String(raw?.plate ?? '').toUpperCase(),
    brand: raw?.brand ?? null,
    model: raw?.model ?? null,
    color: raw?.color ?? null,
    type: normalizeVehicleType(raw?.type),
    status: normalizeVehicleStatus(raw?.status),
    ownerId: raw?.ownerId ?? null,
    ownerName: raw?.ownerName ?? null,
    unitId: String(raw?.unitId ?? ''),
    unitLabel: raw?.unitLabel ?? null,
    structureLabel: raw?.structureLabel ?? null,
    condominiumName: raw?.condominiumName ?? null,
    tag: raw?.tag ?? null,
    notes: raw?.notes ?? null,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
  };
}

function normalizeVehicleType(value: unknown): VehicleType {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'moto' || normalized === 'caminhao' || normalized === 'outro') return normalized;
  return 'carro';
}

function normalizeVehicleStatus(value: unknown): VehicleStatus {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'inativo' || normalized === 'bloqueado') return normalized;
  return 'ativo';
}

export const vehiclesService = {
  async listUnitVehicles(): Promise<Vehicle[]> {
    const selectedUnitId = useAuthStore.getState().selectedUnitId;
    const response = await api.get('/api/v1/vehicles', {
      params: {
        page: 1,
        limit: 100,
        unitId: selectedUnitId || undefined,
      },
    });

    return extractItems(response.data).map(normalizeVehicle).filter((vehicle) => vehicle.id);
  },

  async createVehicle(payload: VehicleCreatePayload): Promise<Vehicle> {
    const response = await api.post('/api/v1/vehicles', payload);
    const vehicle = normalizeVehicle(response.data);
    emitAppRefresh('mutation', { topics: ['vehicles', 'overview'], source: 'vehicles.create' });
    return vehicle;
  },

  async updateVehicle(id: string, payload: VehicleUpdatePayload): Promise<Vehicle> {
    const response = await api.put(`/api/v1/vehicles/${id}`, payload);
    const vehicle = normalizeVehicle(response.data);
    emitAppRefresh('mutation', { topics: ['vehicles', 'overview'], source: 'vehicles.update' });
    return vehicle;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/api/v1/vehicles/${id}`);
    emitAppRefresh('mutation', { topics: ['vehicles', 'overview'], source: 'vehicles.delete' });
  },
};
