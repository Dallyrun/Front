import { afterEach, describe, expect, it } from 'vitest';

import type { AuthTokens, SignupRequest } from '@/types/auth';

import { ApiError } from './client';
import { __resetMockApiForTests, mockApiRequest } from './mockApi';

const SEED_EMAIL = 'test@dallyrun.com';
const SEED_PASSWORD = 'Test1234!@';

afterEach(() => {
  __resetMockApiForTests();
});

function buildSignupForm(overrides: Partial<SignupRequest> = {}): FormData {
  const data = {
    email: 'newrunner@dallyrun.com',
    password: 'NewPass1!@',
    nickname: '러너1',
    ageBracket: 30 as const,
    gender: 'FEMALE' as const,
    ...overrides,
  };
  const fd = new FormData();
  fd.append(
    'data',
    new Blob([JSON.stringify({ ...data, profileImage: undefined })], { type: 'application/json' }),
  );
  fd.append('image', new File([new Uint8Array([1, 2, 3])], 'profile.png', { type: 'image/png' }));
  return fd;
}

describe('mockApiRequest', () => {
  it('logs in the seeded user', async () => {
    const tokens = await mockApiRequest<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: { email: SEED_EMAIL, password: SEED_PASSWORD },
    });
    expect(tokens.accessToken).toMatch(/^mock-access-/);
    expect(tokens.refreshToken).toMatch(/^mock-refresh-/);
  });

  it('rejects login with wrong password as 401', async () => {
    await expect(
      mockApiRequest('/api/auth/login', {
        method: 'POST',
        body: { email: SEED_EMAIL, password: 'wrong' },
      }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('signs up a new user and rejects duplicate email', async () => {
    const first = await mockApiRequest<AuthTokens>('/api/auth/signup', {
      method: 'POST',
      body: buildSignupForm(),
    });
    expect(first.accessToken).toMatch(/^mock-access-/);

    await expect(
      mockApiRequest('/api/auth/signup', {
        method: 'POST',
        body: buildSignupForm({ nickname: '러너2' }),
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('rotates tokens on refresh', async () => {
    const first = await mockApiRequest<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'whatever' },
    });
    const second = await mockApiRequest<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'whatever' },
    });
    expect(second.accessToken).not.toBe(first.accessToken);
    expect(second.refreshToken).not.toBe(first.refreshToken);
  });

  it('logout returns 200 with no body', async () => {
    await expect(
      mockApiRequest('/api/auth/logout', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer mock-access-x' },
      }),
    ).resolves.toBeUndefined();
  });

  it('deleteAccount rejects wrong password as 401', async () => {
    await expect(
      mockApiRequest('/api/members/me', {
        method: 'DELETE',
        body: { password: 'wrong' },
      }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('deleteAccount succeeds with correct password and removes the user', async () => {
    await expect(
      mockApiRequest('/api/members/me', {
        method: 'DELETE',
        body: { password: SEED_PASSWORD },
      }),
    ).resolves.toBeUndefined();

    await expect(
      mockApiRequest('/api/auth/login', {
        method: 'POST',
        body: { email: SEED_EMAIL, password: SEED_PASSWORD },
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('returns 404 for unregistered routes', async () => {
    await expect(mockApiRequest('/api/unknown', { method: 'GET' })).rejects.toMatchObject({
      status: 404,
    });
  });
});
