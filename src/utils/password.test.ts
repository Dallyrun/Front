import { describe, expect, it } from 'vitest';

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  evaluatePassword,
  isPasswordValid,
} from './password';

describe('evaluatePassword', () => {
  it('빈 문자열은 모든 규칙 실패', () => {
    const s = evaluatePassword('');
    expect(s.lengthOk).toBe(false);
    expect(s.hasLetter).toBe(false);
    expect(s.hasDigit).toBe(false);
    expect(s.hasSpecial).toBe(false);
  });

  it('영문 소문자만 있으면 hasLetter 만 true', () => {
    const s = evaluatePassword('abcdefgh');
    expect(s.hasLetter).toBe(true);
    expect(s.hasDigit).toBe(false);
    expect(s.hasSpecial).toBe(false);
    expect(s.lengthOk).toBe(true);
  });

  it('영문 대문자도 hasLetter 에 포함 (대소문자 무관)', () => {
    expect(evaluatePassword('ABCDEFGH').hasLetter).toBe(true);
    expect(evaluatePassword('XyZ12345').hasLetter).toBe(true);
  });

  it('숫자만 있으면 hasDigit 만 true', () => {
    const s = evaluatePassword('12345678');
    expect(s.hasLetter).toBe(false);
    expect(s.hasDigit).toBe(true);
    expect(s.hasSpecial).toBe(false);
  });

  it('특수문자 각 종류 인식', () => {
    for (const ch of ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '=', '+', '.']) {
      expect(evaluatePassword(`abcdefg1${ch}`).hasSpecial).toBe(true);
    }
  });

  it('한글/공백/이모지는 특수문자로 인정하지 않는다', () => {
    expect(evaluatePassword('abc12345한글').hasSpecial).toBe(false);
    expect(evaluatePassword('abc 1234 567').hasSpecial).toBe(false);
    expect(evaluatePassword('abc12345🔥').hasSpecial).toBe(false);
  });

  it(`최소 ${PASSWORD_MIN_LENGTH}자 미만이면 lengthOk=false`, () => {
    expect(evaluatePassword('Ab1!').lengthOk).toBe(false);
    expect(evaluatePassword('Aa1!bcd').lengthOk).toBe(false); // 7자
  });

  it(`최대 ${PASSWORD_MAX_LENGTH}자 초과면 lengthOk=false`, () => {
    const over = 'A1!'.padEnd(PASSWORD_MAX_LENGTH + 1, 'x');
    expect(over.length).toBe(PASSWORD_MAX_LENGTH + 1);
    expect(evaluatePassword(over).lengthOk).toBe(false);
  });

  it(`정확히 ${PASSWORD_MIN_LENGTH}자와 ${PASSWORD_MAX_LENGTH}자는 lengthOk=true`, () => {
    const min = 'Aa1!bcde'; // 8자
    expect(min.length).toBe(PASSWORD_MIN_LENGTH);
    expect(evaluatePassword(min).lengthOk).toBe(true);

    const max = 'Aa1!'.padEnd(PASSWORD_MAX_LENGTH, 'x');
    expect(max.length).toBe(PASSWORD_MAX_LENGTH);
    expect(evaluatePassword(max).lengthOk).toBe(true);
  });
});

describe('isPasswordValid', () => {
  it('네 가지 규칙이 모두 충족될 때만 true', () => {
    expect(isPasswordValid('Abcd1234!')).toBe(true);
    expect(isPasswordValid('Qwerty12@')).toBe(true);
  });

  it('한 가지라도 빠지면 false', () => {
    expect(isPasswordValid('abcd1234!')).toBe(true); // 대문자 없어도 소문자가 letter 로 인정돼 통과
    expect(isPasswordValid('abcdefgh!')).toBe(false); // 숫자 없음
    expect(isPasswordValid('12345678!')).toBe(false); // 영문 없음
    expect(isPasswordValid('abcdefgh1')).toBe(false); // 특수문자 없음
    expect(isPasswordValid('Ab1!')).toBe(false); // 길이 부족
  });
});
