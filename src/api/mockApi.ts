import type { AgeBracket, AuthTokens, Gender, LoginRequest } from '@/types/auth';

import { ApiError, type RequestOptions } from './client';

interface MockUser {
  email: string;
  password: string;
  nickname: string;
  ageBracket: AgeBracket;
  gender: Gender;
}

interface MockSignupData {
  email: string;
  password: string;
  nickname: string;
  ageBracket: AgeBracket;
  gender: Gender;
}

const MOCK_LATENCY_MS = 200;

const users = new Map<string, MockUser>();
const nicknames = new Set<string>();

const SEED_USER: MockUser = {
  email: 'test@dallyrun.com',
  password: 'Test1234!@',
  nickname: '테스터',
  ageBracket: 30,
  gender: 'MALE',
};
users.set(SEED_USER.email, SEED_USER);
nicknames.add(SEED_USER.nickname);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function issueTokens(): AuthTokens {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return {
    accessToken: `mock-access-${stamp}`,
    refreshToken: `mock-refresh-${stamp}`,
  };
}

async function readJsonBody<T>(body: unknown): Promise<T | null> {
  if (body === undefined || body === null) return null;
  if (typeof body === 'string') return JSON.parse(body) as T;
  return body as T;
}

async function readSignupFormData(body: unknown): Promise<MockSignupData> {
  if (!(body instanceof FormData)) {
    throw new ApiError(400, 'mock: signup body must be FormData');
  }
  const dataPart = body.get('data');
  if (!dataPart) {
    throw new ApiError(400, 'mock: signup data part missing');
  }
  const text = await readBlobOrString(dataPart);
  return JSON.parse(text) as MockSignupData;
}

async function readBlobOrString(part: FormDataEntryValue): Promise<string> {
  if (typeof part === 'string') return part;
  const maybe = part as Blob & {
    arrayBuffer?: () => Promise<ArrayBuffer>;
    text?: () => Promise<string>;
  };
  if (typeof maybe.text === 'function') return maybe.text();
  if (typeof maybe.arrayBuffer === 'function') {
    const buf = await maybe.arrayBuffer();
    return new TextDecoder().decode(buf);
  }
  // jsdom 의 File 은 둘 다 미구현 — FileReader 로 폴백
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsText(part as Blob);
  });
}

export function __resetMockApiForTests(): void {
  users.clear();
  nicknames.clear();
  users.set(SEED_USER.email, SEED_USER);
  nicknames.add(SEED_USER.nickname);
}

export async function mockApiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  await delay(MOCK_LATENCY_MS);

  const method = (options.method ?? 'GET').toUpperCase();
  const route = `${method} ${path}`;

  switch (route) {
    case 'POST /api/auth/login': {
      const body = await readJsonBody<LoginRequest>(options.body);
      if (!body?.email || !body.password) {
        throw new ApiError(400, '이메일과 비밀번호를 입력해 주세요.');
      }
      const user = users.get(body.email);
      if (!user || user.password !== body.password) {
        throw new ApiError(401, '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      return issueTokens() as T;
    }

    case 'POST /api/auth/signup': {
      const data = await readSignupFormData(options.body);
      if (users.has(data.email)) {
        throw new ApiError(409, '이미 가입된 이메일입니다.');
      }
      if (nicknames.has(data.nickname)) {
        throw new ApiError(409, '이미 사용 중인 닉네임입니다.');
      }
      const user: MockUser = {
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        ageBracket: data.ageBracket,
        gender: data.gender,
      };
      users.set(user.email, user);
      nicknames.add(user.nickname);
      return issueTokens() as T;
    }

    case 'POST /api/auth/refresh': {
      return issueTokens() as T;
    }

    case 'DELETE /api/auth/logout': {
      return undefined as T;
    }

    case 'DELETE /api/members/me': {
      const body = await readJsonBody<{ password?: string }>(options.body);
      const password = body?.password;
      if (!password) {
        throw new ApiError(400, '비밀번호를 입력해 주세요.');
      }
      const target = Array.from(users.values()).find((u) => u.password === password);
      if (!target) {
        throw new ApiError(401, '비밀번호가 올바르지 않습니다.');
      }
      users.delete(target.email);
      nicknames.delete(target.nickname);
      return undefined as T;
    }

    default:
      throw new ApiError(404, `mock: route not registered (${route})`);
  }
}
