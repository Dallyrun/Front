import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AuthTokens, AuthUser } from '@/types/auth';

interface AuthState {
  tokens: AuthTokens | null;
  /**
   * 현재 백엔드는 로그인/가입 응답에 user 정보를 포함하지 않으므로 항상 null.
   * 이후 `/api/me` 류 엔드포인트가 생기면 fetch 후 setUser 로 채움.
   */
  user: AuthUser | null;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

/**
 * 인증 상태. persist 미들웨어가 기본 localStorage 를 사용해 `dallyrun-auth` 키에
 * 영속화하여 새로고침·탭 재진입 후에도 세션 유지.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      user: null,
      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      clear: () => set({ tokens: null, user: null }),
    }),
    {
      name: 'dallyrun-auth',
      partialize: (state) => ({ tokens: state.tokens, user: state.user }),
    },
  ),
);
