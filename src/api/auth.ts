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

/**
 * 회원탈퇴. `DELETE /api/members/me` + Authorization 헤더 + JSON `{ password }`.
 * 서버는 계정을 soft delete 하고 refresh token 도 함께 폐기.
 *
 * ⚠️ 401 의 의미가 두 가지 (INVALID_TOKEN / INVALID_CREDENTIALS) 이지만 HTTP status
 * 만으로 구분 불가. UI 에선 "비밀번호가 올바르지 않습니다" 로 일관 처리. (토큰 만료
 * 동시 발생 시엔 재로그인 후 재시도하면 됨.)
 *
 * authedRequest 를 쓰지 않는 이유: 401 자동 refresh 재시도가 비번 불일치 케이스에서
 * 사용자를 마이페이지에서 튕겨나가게 만들 수 있음 (refresh 성공 → 재시도 → 다시 401 →
 * store clear). 그래서 plain apiRequest 로 명시적 호출.
 */
export function deleteAccount(accessToken: string, password: string): Promise<void> {
  return apiRequest<void>('/api/members/me', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { password },
  });
}
