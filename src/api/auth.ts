import type { AuthResponse, LoginRequest, SignupRequest } from '@/types/auth';

import { apiRequest } from './client';

export function loginWithEmail(body: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body,
  });
}

/**
 * 회원가입. multipart/form-data 로 전송.
 * 백엔드는 `/api/auth/register` 에서 email / password / nickname / ageGroup / gender 필드와
 * 필수 파일 `profileImage` 를 수신한다.
 * ageGroup 은 "20"/"30"/"40"/"50"/"60" 문자열로 직렬화되며 백엔드에서 Integer 로 파싱.
 */
export function signupWithEmail(body: SignupRequest): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('email', body.email);
  formData.append('password', body.password);
  formData.append('nickname', body.nickname);
  formData.append('ageGroup', String(body.ageGroup));
  formData.append('gender', body.gender);
  formData.append('profileImage', body.profileImage);

  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: formData,
  });
}
