export type UserRole = 'MASTER' | 'ADMIN' | 'OPERACIONAL' | 'CENTRAL' | 'SINDICO' | 'PORTARIA' | 'MORADOR';
export type BackendFaceStatus = 'NO_PHOTO' | 'PHOTO_ONLY' | 'FACE_PENDING_SYNC' | 'FACE_SYNCED' | 'FACE_ERROR';
export type BackendUserScopeType = 'GLOBAL' | 'ASSIGNED' | 'UNIT' | 'RESIDENT' | 'UNSCOPED';

export type Permission = {
  viewPeople: boolean;
  addPerson: boolean;
  editPerson: boolean;
  deletePerson: boolean;
  viewAlerts: boolean;
  createAlert: boolean;
  viewCameras: boolean;
  viewPanic: boolean;
  viewProfile: boolean;
  editProfile: boolean;
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string | null;
  cpf?: string | null;
  apartment?: string | null;
  emergencyContact?: string | null;
  photoUri?: string | null;
  personId?: string | null;
  personName?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  condominiumId?: string | null;
  condominiumIds?: string[];
  permissions?: string[];
  effectiveAccess?: Record<string, boolean>;
  scopeType?: BackendUserScopeType | string | null;
  selectedUnitId?: string | null;
  selectedUnitName?: string | null;
  requiresUnitSelection?: boolean;
  unitIds?: string[];
  unitNames?: string[];
  streetIds?: string[];
  hasFacialCredential?: boolean;
  faceStatus?: BackendFaceStatus | null;
  faceUpdatedAt?: string | null;
  faceErrorMessage?: string | null;
  profileSource?: string | null;
}

const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  MASTER: {
    viewPeople: true,
    addPerson: true,
    editPerson: true,
    deletePerson: true,
    viewAlerts: true,
    createAlert: true,
    viewCameras: true,
    viewPanic: true,
    viewProfile: true,
    editProfile: true,
  },
  ADMIN: {
    viewPeople: true,
    addPerson: true,
    editPerson: true,
    deletePerson: true,
    viewAlerts: true,
    createAlert: true,
    viewCameras: true,
    viewPanic: true,
    viewProfile: true,
    editProfile: true,
  },
  OPERACIONAL: {
    viewPeople: true,
    addPerson: true,
    editPerson: false,
    deletePerson: false,
    viewAlerts: true,
    createAlert: true,
    viewCameras: true,
    viewPanic: true,
    viewProfile: true,
    editProfile: false,
  },
  CENTRAL: {
    viewPeople: true,
    addPerson: false,
    editPerson: false,
    deletePerson: false,
    viewAlerts: true,
    createAlert: true,
    viewCameras: true,
    viewPanic: true,
    viewProfile: true,
    editProfile: false,
  },
  SINDICO: {
    viewPeople: true,
    addPerson: true,
    editPerson: true,
    deletePerson: false,
    viewAlerts: true,
    createAlert: true,
    viewCameras: true,
    viewPanic: true,
    viewProfile: true,
    editProfile: true,
  },
  PORTARIA: {
    viewPeople: true,
    addPerson: true,
    editPerson: false,
    deletePerson: false,
    viewAlerts: true,
    createAlert: true,
    viewCameras: true,
    viewPanic: true,
    viewProfile: true,
    editProfile: false,
  },
  MORADOR: {
    viewPeople: false,
    addPerson: false,
    editPerson: false,
    deletePerson: false,
    viewAlerts: true,
    createAlert: false,
    viewCameras: false,
    viewPanic: true,
    viewProfile: true,
    editProfile: true,
  },
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[role]?.[permission as keyof Permission] || false;
};

const BACKEND_PERMISSION_ALIASES: Partial<Record<keyof Permission, string[]>> = {
  viewPeople: ['viewPeople', 'people.view', 'people:read', 'people_view', 'people_read'],
  addPerson: ['addPerson', 'people.create', 'people:create', 'people:create-resident', 'people_create'],
  editPerson: ['editPerson', 'people.update', 'people:update', 'people_update'],
  deletePerson: ['deletePerson', 'people.delete', 'people:delete', 'people_delete'],
  viewAlerts: ['viewAlerts', 'alerts.view', 'alerts:read', 'alerts_view', 'alerts_read'],
  createAlert: ['createAlert', 'alerts.create', 'alerts:create', 'alerts_create'],
  viewCameras: ['viewCameras', 'cameras.view', 'cameras:read', 'cameras_view', 'cameras_read'],
  viewPanic: ['viewPanic', 'panic.view', 'panic:read', 'panic_view', 'panic_read'],
  viewProfile: ['viewProfile', 'profile.view', 'profile:read', 'profile_view', 'profile_read'],
  editProfile: ['editProfile', 'profile.update', 'profile:write', 'profile:update', 'profile_update', 'profile_write'],
};

export const getPermissions = (role: UserRole, backendPermissions?: string[] | null): Permission => {
  const base = ROLE_PERMISSIONS[role];
  if (!backendPermissions?.length) return base;

  const granted = new Set(backendPermissions.map((item) => String(item)));
  const merged = { ...base };

  (Object.keys(BACKEND_PERMISSION_ALIASES) as (keyof Permission)[]).forEach((key) => {
    const aliases = BACKEND_PERMISSION_ALIASES[key] ?? [key];
    if (aliases.some((alias) => granted.has(alias))) {
      merged[key] = true;
    }
  });

  return merged;
};

export const hasEffectiveAccess = (user: User | null | undefined, key: string): boolean => {
  if (!user?.effectiveAccess) return false;
  const normalized = key.trim().toLowerCase();
  return Object.entries(user.effectiveAccess).some(([entryKey, allowed]) => {
    if (!allowed) return false;
    return entryKey.trim().toLowerCase() === normalized;
  });
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    MASTER: 'Master',
    ADMIN: 'Administrador',
    OPERACIONAL: 'Operacional',
    CENTRAL: 'Central',
    SINDICO: 'Sindico',
    PORTARIA: 'Portaria',
    MORADOR: 'Morador',
  };
  return labels[role];
};

export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    MASTER: '#7C3AED',
    ADMIN: '#EF4444',
    OPERACIONAL: '#0EA5E9',
    CENTRAL: '#6366F1',
    SINDICO: '#2563EB',
    PORTARIA: '#F59E0B',
    MORADOR: '#10B981',
  };
  return roleColors[role];
};

export const canUseResidentApp = (role: UserRole): boolean => {
  return role === 'MORADOR' || role === 'SINDICO';
};
