import { useAuthStore } from '@/stores/authStore';

import { refreshTokens } from './auth';
import { ApiError, apiRequest, type RequestOptions } from './client';

/**
 * 인증이 필요한 API 호출용 래퍼.
 *
 * 동작:
 * 1. authStore 에서 현재 accessToken 을 읽어 `Authorization: Bearer <token>` 로 요청
 * 2. 401 을 받으면 `refreshTokens` 1회 호출 → 성공 시 새 access 로 재시도
 * 3. refresh 도 실패하면 authStore 를 clear (UI 에서 ProtectedRoute 로 감지해서 /login 리다이렉트)
 * 4. 그 외 에러는 그대로 throw
 */
export async function authedRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const state = useAuthStore.getState();
  if (!state.tokens) {
    throw new ApiError(401, 'Not authenticated');
  }

  const doRequest = (accessToken: string) =>
    apiRequest<T>(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers ?? {}),
      },
    });

  try {
    return await doRequest(state.tokens.accessToken);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err;

    // 401 → refresh 시도
    const currentRefresh = useAuthStore.getState().tokens?.refreshToken;
    if (!currentRefresh) {
      useAuthStore.getState().clear();
      throw err;
    }

    try {
      const next = await refreshTokens(currentRefresh);
      useAuthStore.getState().setTokens(next);
      return await doRequest(next.accessToken);
    } catch (refreshErr) {
      useAuthStore.getState().clear();
      throw refreshErr;
    }
  }
}
