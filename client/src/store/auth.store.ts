import { create } from 'zustand';
import type { Admin, RolesAdmin } from '@/types';

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setAuth: (admin: Admin, tokens: { access_token: string; refresh_token: string }) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  accessToken: null,

  hydrate: () => {
    const token = localStorage.getItem('access_token');
    const adminRaw = localStorage.getItem('admin');
    if (token && adminRaw) {
      try {
        const admin = JSON.parse(adminRaw) as Admin;
        set({ admin, isAuthenticated: true, accessToken: token });
      } catch {
        localStorage.clear();
      }
    }
  },

  setAuth: (admin, tokens) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('admin_id', String(admin.id));
    localStorage.setItem('admin', JSON.stringify(admin));
    set({ admin, isAuthenticated: true, accessToken: tokens.access_token });
  },

  logout: () => {
    localStorage.clear();
    set({ admin: null, isAuthenticated: false, accessToken: null });
  },
}));

export const isSuperAdmin = (role?: RolesAdmin) => role === 'superadmin';
