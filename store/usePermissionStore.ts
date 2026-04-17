import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { getStorageItemWithLegacy, LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '../constants/storage';
import { getPermissions, type Permission, type User, type UserRole } from '../utils/permissionsManager';

interface PermissionStore {
  currentUser: User | null;
  users: User[];
  permissions: Permission | null;
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  changeUserRole: (id: string, newRole: UserRole) => void;
  loadUsers: () => Promise<void>;
  saveUsers: () => Promise<void>;
  checkPermission: (permission: keyof Permission) => boolean;
  logout: () => void;
}

const USERS_STORAGE_KEY = STORAGE_KEYS.permissionUsers;

export const usePermissionStore = create<PermissionStore>((set, get) => ({
  currentUser: null,
  users: [],
  permissions: null,
  loading: false,
  error: null,

  setCurrentUser: (user) => {
    set({ currentUser: user, permissions: user ? getPermissions(user.role, user.permissions) : null });
  },

  setUsers: (users) => set({ users }),

  addUser: (user) => {
    const { users } = get();
    set({ users: [...users, user] });
  },

  updateUser: (id, updates) => {
    const { users } = get();
    set({
      users: users.map((user) => (user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user)),
    });
  },

  deleteUser: (id) => {
    const { users } = get();
    set({ users: users.filter((user) => user.id !== id) });
  },

  changeUserRole: (id, newRole) => {
    const { users } = get();
    set({
      users: users.map((user) => (user.id === id ? { ...user, role: newRole, updatedAt: new Date().toISOString() } : user)),
    });
  },

  loadUsers: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getStorageItemWithLegacy(USERS_STORAGE_KEY, LEGACY_STORAGE_KEYS.permissionUsers);
      if (data) {
        set({ users: JSON.parse(data) });
      }
    } catch (error) {
      set({ error: 'Erro ao carregar usuarios' });
      console.error('Erro ao carregar usuarios:', error);
    } finally {
      set({ loading: false });
    }
  },

  saveUsers: async () => {
    try {
      const { users } = get();
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      set({ error: 'Erro ao salvar usuarios' });
      console.error('Erro ao salvar usuarios:', error);
    }
  },

  checkPermission: (permission) => {
    const { permissions } = get();
    return permissions ? permissions[permission] : false;
  },

  logout: () => {
    set({ currentUser: null, permissions: null });
  },
}));
