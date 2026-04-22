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

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  // FormData 인 경우 Content-Type 을 설정하지 않아야 브라우저가 boundary 포함해서 자동 설정한다.
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
    throw new ApiError(response.status, `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
