import api from './api';
import type { PermissionMatrixItem } from '../types/permissionMatrix';

function normalizePermissionMatrixItem(raw: any): PermissionMatrixItem {
  return {
    role: String(raw?.role ?? ''),
    permissions: Array.isArray(raw?.permissions) ? raw.permissions.map((item: unknown) => String(item)) : [],
  };
}

export const permissionsMatrixService = {
  async list(): Promise<PermissionMatrixItem[]> {
    const response = await api.get('/api/v1/auth/permissions-matrix');
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizePermissionMatrixItem).filter((item) => item.role);
  },
};
