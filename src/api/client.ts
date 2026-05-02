import type { ApiEnvelope, ApiErrorBody } from '@/types/auth';

import { mockApiRequest } from './mockApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

/**
 * HTTP 응답이 왔지만 4xx/5xx 인 경우. `status` 코드 + 서버 제공 message 를 담음.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 네트워크 레벨에서 요청이 실패한 경우 (서버 다운, DNS 실패, CORS preflight 실패,
 * 오프라인, 네트워크 끊김 등). 응답 자체가 없어 status 가 없음.
 * fetch 가 던진 `TypeError: Failed to fetch` 를 이 타입으로 래핑해 일관되게 다룬다.
 */
export class NetworkError extends Error {
  constructor(message = '서버에 연결할 수 없습니다.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

/**
 * 서버 규약:
 * - 성공: `{ "data": T }` 로 감싸서 반환 → 자동 unwrap
 * - 에러: `{ "message": "..." }` → ApiError.message 로 매핑
 * - body 가 `FormData` 이면 Content-Type 을 설정하지 않음 (브라우저가 boundary 자동 설정)
 * - body 가 그 외이면 JSON 직렬화
 * - fetch 자체가 실패하면 `NetworkError` 로 rethrow
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (USE_MOCK_API) {
    return mockApiRequest<T>(path, options);
  }

  const { body, headers, ...rest } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders: HeadersInit = isFormData
    ? { ...headers }
    : { 'Content-Type': 'application/json', ...headers };

  const finalBody: BodyInit | undefined =
    body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: finalBody,
    });
  } catch (err) {
    // fetch 가 reject 하는 경우: 네트워크 실패(TypeError), AbortError 등.
    // 원 에러 메시지를 내부적으로 보관해두면 디버깅에 유리.
    const cause = err instanceof Error ? err.message : String(err);
    throw new NetworkError(`서버에 연결할 수 없습니다. (${cause})`);
  }

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const errBody = (await response.json()) as ApiErrorBody;
      if (errBody?.message) message = errBody.message;
    } catch {
      // JSON 이 아니거나 비어있을 수 있음 — 기본 메시지 유지
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  const parsed = JSON.parse(text);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'data' in parsed) {
    return (parsed as ApiEnvelope<T>).data;
  }
  return parsed as T;
}
