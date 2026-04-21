import type { AuthResponse, LoginRequest, SignupRequest } from '@/types/auth';

import { apiRequest } from './client';

export function loginWithEmail(body: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body,
  });
}

export function signupWithEmail(body: SignupRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body,
  });
}
