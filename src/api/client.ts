import type { ApiEnvelope, ApiErrorBody } from '@/types/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
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
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders: HeadersInit = isFormData
    ? { ...headers }
    : { 'Content-Type': 'application/json', ...headers };

  const finalBody: BodyInit | undefined =
    body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

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
