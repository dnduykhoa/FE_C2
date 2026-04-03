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
  const rawRole = user?.role;

  if (!rawRole) {
    return '';
  }

  if (typeof rawRole === 'string') {
    if (/^[a-fA-F0-9]{24}$/.test(rawRole)) {
      return '';
    }
    return rawRole.toUpperCase();
  }

  return String(rawRole.name || rawRole.roleName || '').toUpperCase();
}
