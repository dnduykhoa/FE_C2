import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: '',
      user: null,
      setAuth: (payload) => set({ token: payload.token || '', user: payload.user || null }),
      clearAuth: () => set({ token: '', user: null })
    }),
    {
      name: 'fe_c2_auth_storage'
    }
  )
);

export function getRoleName(user) {
  return String(user?.role?.name || '').toUpperCase();
}
