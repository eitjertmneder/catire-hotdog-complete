import { create } from 'zustand';
import { User, UserDTO } from '../models/User';
import userApi from '../api/user.api';
import { useAuthStore } from '../../../shared/store/auth.store';

interface UserState {
  users: User[];
  loading: boolean;
  
  // Métodos CRUD
  fetchUsers: () => Promise<void>;
  createUser: (data: UserDTO) => Promise<void>;
  updateUser: (id: number | string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: number | string) => Promise<void>;
  
  // Método específico para el perfil
  updateProfile: (data: Partial<UserDTO>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    const { token } = useAuthStore.getState();
    if (token) {
      const response = await userApi.getUsers(token);
      set({ users: response.data || [], loading: false });
    } else {
      set({ loading: false });
    }
  },

  createUser: async (data: UserDTO) => {
    set({ loading: true });
    const { token } = useAuthStore.getState();
    if (token) {
      await userApi.createUser(token, data);
      await get().fetchUsers(); // Refrescar lista
    }
    set({ loading: false });
  },

  updateUser: async (id: number | string, data: Partial<User>) => {
    set({ loading: true });
    const { token } = useAuthStore.getState();
    if (token) {
      await userApi.updateUser(token, id, data);
      await get().fetchUsers();
    }
    set({ loading: false });
  },

  deleteUser: async (id: number | string) => {
    set({ loading: true });
    const { token } = useAuthStore.getState();
    if (token) {
      const response = await userApi.deleteUser(token, id);
      if (!response.error) {
        set({ users: get().users.filter(u => u.id !== id), loading: false });
      } else {
        set({ loading: false });
      }
    }
  },

  updateProfile: async (data: Partial<UserDTO>) => {
    set({ loading: true });
    const { token, user, setUser } = useAuthStore.getState();
    
    try {
      if (!token || !user) throw new Error("No autenticado");
      
      const response = await userApi.updateUser(token, user.id, data);
      
      if (response.data) {
        // Actualizamos el usuario global en auth.store
        setUser({ ...user, ...response.data });
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
    } finally {
      set({ loading: false });
    }
  },
}));