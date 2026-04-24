import type { AuthTokens, LoginRequest, SignupRequest } from '@/types/auth';

import { ApiError, apiRequest } from './client';

/**
 * 로그인. JSON 요청.
 * `POST /api/auth/login` → `{ accessToken, refreshToken }` (envelope 은 apiRequest 가 unwrap)
 */
export function loginWithEmail(body: LoginRequest): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/api/auth/login', {
    method: 'POST',
    body,
  });
}

/**
 * 회원가입. `POST /api/auth/signup` multipart/form-data, 파트 2개:
 * - `data`: JSON 파트 (Content-Type: application/json). 필드: email / password / nickname / ageBracket / gender
 * - `image`: 프로필 이미지 파일 (필수)
 *
 * ⚠️ `data` 파트는 반드시 Content-Type=application/json 이어야 서버가 수용.
 * Blob 으로 래핑하면서 type 을 명시.
 */
export function signupWithEmail(body: SignupRequest): Promise<AuthTokens> {
  const { profileImage, ...rest } = body;
  const jsonPart = new Blob([JSON.stringify(rest)], { type: 'application/json' });

  const formData = new FormData();
  formData.append('data', jsonPart);
  formData.append('image', profileImage);

  return apiRequest<AuthTokens>('/api/auth/signup', {
    method: 'POST',
    body: formData,
  });
}

/**
 * 토큰 갱신. `POST /api/auth/refresh` JSON.
 * 서버는 새 access/refresh 쌍을 반환하고 기존 refresh 를 무효화(rotation).
 * 401 이면 재로그인 필요.
 */
export function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return apiRequest<AuthTokens>('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

/**
 * 로그아웃. `DELETE /api/auth/logout` + Authorization 헤더.
 * 서버가 refresh token 을 제거. 호출자는 응답과 관계없이 로컬 토큰도 지워야 함.
 * 이 함수는 서버 실패(401/500 등) 에도 throw 는 하지 않고 조용히 넘어감 — 로컬 정리는 호출자가 보장.
 */
export async function logout(accessToken: string): Promise<void> {
  try {
    await apiRequest<void>('/api/auth/logout', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
    // ApiError 는 swallow — 로컬 정리를 보장하는 게 우선
  }
}
