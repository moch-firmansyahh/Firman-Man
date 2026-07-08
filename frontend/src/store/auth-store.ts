import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      set({ user: res.data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
      set({ user: null, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },

  checkMe: async () => {
    set({ loading: true });
    try {
      const res = await apiFetch('/auth/me');
      set({ user: res.data, loading: false, initialized: true });
    } catch (error) {
      set({ user: null, loading: false, initialized: true });
    }
  },
}));
