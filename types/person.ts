export type MinorFacialAuthorization = {
  authorized: boolean;
  guardianName?: string | null;
  guardianDocument?: string | null;
  relationship?: string | null;
  authorizationSource?: string | null;
  authorizedAt?: string | null;
  notes?: string | null;
};

export type Person = {
  id: string;
  name: string;
  category: 'RESIDENT' | 'VISITOR' | 'SERVICE_PROVIDER' | 'DELIVERER' | 'RENTER';
  categoryLabel: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE' | 'BLOCKED';
  statusLabel: string;
  photoUrl?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  unitIds?: string[];
  unitNames?: string[];
  accessGroupIds?: string[];
  accessGroupNames?: string[];
  phone?: string | null;
  email?: string | null;
  document?: string | null;
  documentType?: 'CPF' | 'RG' | 'CNH' | null;
  birthDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
  serviceType?: string | null;
  serviceCompany?: string | null;
  vehiclePlate?: string | null;
  authorizedWeekdays?: string[];
  accessStartTime?: string | null;
  accessEndTime?: string | null;
  minorFacialAuthorization?: MinorFacialAuthorization | null;
};

export type PersonAccessSummary = {
  personId: string;
  personName?: string | null;
  totalAccesses: number;
  entries: number;
  exits: number;
  denied: number;
  lastAccessAt?: string | null;
  lastDirection?: 'ENTRY' | 'EXIT' | string | null;
  lastResult?: 'ALLOWED' | 'DENIED' | string | null;
  lastEntryAt?: string | null;
  lastExitAt?: string | null;
  isInsideNow: boolean;
  accessesToday: number;
  operatorUserName?: string | null;
  cameraName?: string | null;
  location?: string | null;
};
