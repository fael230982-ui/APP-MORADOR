export type VehicleType = 'carro' | 'moto' | 'caminhao' | 'outro';
export type VehicleStatus = 'ativo' | 'inativo' | 'bloqueado';

export type Vehicle = {
  id: string;
  plate: string;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  type: VehicleType;
  status: VehicleStatus;
  ownerId?: string | null;
  ownerName?: string | null;
  unitId: string;
  unitLabel?: string | null;
  structureLabel?: string | null;
  condominiumName?: string | null;
  tag?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type VehicleCreatePayload = {
  plate: string;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  type: VehicleType;
  ownerId?: string | null;
  unitId: string;
  tag?: string | null;
  notes?: string | null;
};

export type VehicleUpdatePayload = Partial<VehicleCreatePayload> & {
  status?: VehicleStatus;
};
