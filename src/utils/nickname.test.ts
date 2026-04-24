import { describe, expect, it } from 'vitest';

import { NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH, isNicknameValid } from './nickname';

describe('isNicknameValid', () => {
  it('정상 케이스', () => {
    expect(isNicknameValid('러너')).toBe(true);
    expect(isNicknameValid('runner')).toBe(true);
    expect(isNicknameValid('러너123')).toBe(true);
    expect(isNicknameValid('Runner01')).toBe(true);
    // 정확히 최소 길이
    expect(isNicknameValid('A'.repeat(NICKNAME_MIN_LENGTH))).toBe(true);
    // 정확히 최대 길이
    expect(isNicknameValid('A'.repeat(NICKNAME_MAX_LENGTH))).toBe(true);
    expect(isNicknameValid('달리는러너runner')).toBe(true); // 12자
  });

  it(`${NICKNAME_MIN_LENGTH}자 미만은 실패`, () => {
    expect(isNicknameValid('')).toBe(false);
    expect(isNicknameValid('a')).toBe(false);
    expect(isNicknameValid('가')).toBe(false);
  });

  it(`${NICKNAME_MAX_LENGTH}자 초과는 실패`, () => {
    expect(isNicknameValid('A'.repeat(NICKNAME_MAX_LENGTH + 1))).toBe(false);
    expect(isNicknameValid('달리런러너Runner0123')).toBe(false); // 13+자
  });

  it('공백이 포함되면 실패', () => {
    expect(isNicknameValid('러 너')).toBe(false);
    expect(isNicknameValid(' 러너')).toBe(false);
    expect(isNicknameValid('러너 ')).toBe(false);
    expect(isNicknameValid('run ner')).toBe(false);
  });

  it('특수문자가 포함되면 실패', () => {
    expect(isNicknameValid('러너!')).toBe(false);
    expect(isNicknameValid('run_ner')).toBe(false);
    expect(isNicknameValid('runner.')).toBe(false);
    expect(isNicknameValid('run-ner')).toBe(false);
  });

  it('자모(ㄱㄴㄷㅏㅓ)만 있으면 실패 — 완성형만 허용', () => {
    expect(isNicknameValid('ㅎㅇ')).toBe(false);
    expect(isNicknameValid('ㄱㄴㄷ')).toBe(false);
    expect(isNicknameValid('ㅏㅓㅣ')).toBe(false);
  });

  it('이모지/전각문자는 실패', () => {
    expect(isNicknameValid('러너🔥')).toBe(false);
    expect(isNicknameValid('runner🏃')).toBe(false);
    expect(isNicknameValid('러너１２')).toBe(false); // 전각 숫자
  });
});
