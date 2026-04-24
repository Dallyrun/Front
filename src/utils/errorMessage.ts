import { ApiError, NetworkError } from '@/api/client';

const NETWORK_MESSAGE = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.';

/**
 * 에러를 사용자에게 보여줄 한글 메시지로 변환한다.
 *
 * 우선순위:
 * 1. `NetworkError` (또는 raw `TypeError` — 방어적) → 네트워크 안내
 * 2. `ApiError` → 서버가 준 message 있으면 그대로, 없으면 `${fallback} (${status})`
 * 3. 일반 `Error` → `error.message`
 * 4. 그 외 (unknown) → fallback
 */
export function toUserMessage(
  err: unknown,
  fallback = '요청 처리 중 오류가 발생했습니다.',
): string {
  if (err instanceof NetworkError) {
    return NETWORK_MESSAGE;
  }
  if (err instanceof ApiError) {
    return err.message || `${fallback} (${err.status})`;
  }
  // apiRequest 가 래핑하지만, 혹시 우회된 경로에서 raw TypeError 가 올 경우 보호
  if (err instanceof TypeError) {
    return NETWORK_MESSAGE;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
