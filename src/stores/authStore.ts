import { create } from 'zustand';

import type { AuthToken, AuthUser } from '@/types/auth';

interface AuthState {
  token: AuthToken | null;
  user: AuthUser | null;
  setAuth: (token: AuthToken, user: AuthUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  clear: () => set({ token: null, user: null }),
}));
