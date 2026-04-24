import { describe, expect, it } from 'vitest';

import { ApiError, NetworkError } from '@/api/client';

import { toUserMessage } from './errorMessage';

describe('toUserMessage', () => {
  it('NetworkError 는 일관된 네트워크 메시지로 변환된다', () => {
    const msg = toUserMessage(new NetworkError(), '로그인에 실패했습니다.');
    expect(msg).toMatch(/서버에 연결할 수 없습니다/);
  });

  it('ApiError 의 서버 message 가 있으면 그대로 반환', () => {
    const err = new ApiError(409, '이미 가입된 이메일입니다.');
    expect(toUserMessage(err, '회원가입에 실패했습니다.')).toBe('이미 가입된 이메일입니다.');
  });

  it('ApiError 의 message 가 비어있으면 fallback 에 상태 코드를 붙여 반환', () => {
    const err = new ApiError(500, '');
    expect(toUserMessage(err, '로그인에 실패했습니다.')).toBe('로그인에 실패했습니다. (500)');
  });

  it('raw TypeError 도 네트워크 메시지로 변환 (방어적)', () => {
    expect(toUserMessage(new TypeError('Failed to fetch'))).toMatch(/서버에 연결할 수 없습니다/);
  });

  it('일반 Error 는 자체 message 를 반환', () => {
    expect(toUserMessage(new Error('뭔가 문제가 생겼어요'))).toBe('뭔가 문제가 생겼어요');
  });

  it('unknown / message 없는 값은 fallback 반환', () => {
    expect(toUserMessage(undefined, '기본 메시지')).toBe('기본 메시지');
    expect(toUserMessage(null, '기본 메시지')).toBe('기본 메시지');
    expect(toUserMessage('문자열 에러', '기본 메시지')).toBe('기본 메시지');
    // Error 이지만 message 가 빈 문자열인 경우 → fallback
    expect(toUserMessage(new Error(''), '기본 메시지')).toBe('기본 메시지');
  });

  it('fallback 기본값이 있다', () => {
    expect(toUserMessage(undefined)).toMatch(/요청 처리 중 오류가 발생했습니다/);
  });
});
