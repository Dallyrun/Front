import type { AuthResponse, LoginRequest, SignupRequest } from '@/types/auth';

import { apiRequest } from './client';

export function loginWithEmail(body: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body,
  });
}

/**
 * 회원가입. 프로필 이미지가 있으면 multipart/form-data 로 전송.
 * 백엔드는 `/api/auth/register` 에서 email/password/nickname 필드와
 * 선택적인 `profileImage` 파일을 수신해야 한다.
 */
export function signupWithEmail(body: SignupRequest): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('email', body.email);
  formData.append('password', body.password);
  formData.append('nickname', body.nickname);
  if (body.profileImage) {
    formData.append('profileImage', body.profileImage);
  }

  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: formData,
  });
}
