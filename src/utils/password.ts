/**
 * 비밀번호 규칙 (Backend 와 동일):
 * - 8자 이상 30자 이하
 * - 영문자(대소문자 무관) 포함
 * - 숫자 포함
 * - ASCII 특수기호 포함 (! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~)
 * - 위 세 집합(ASCII)에 속하는 문자만 허용 (공백·한글·이모지·전각문자·제어문자 등 금지)
 *
 * 서버 정규식: ^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!-/:-@\[-`{-~])[A-Za-z0-9!-/:-@\[-`{-~]{8,30}$
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 30;

const LETTER_PATTERN = /[A-Za-z]/;
const DIGIT_PATTERN = /[0-9]/;
// prettier-ignore
const SPECIAL_PATTERN = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~\\]/;
// prettier-ignore
const ALLOWED_CHARS_PATTERN = /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~\\]+$/;

export interface PasswordRuleStatus {
  lengthOk: boolean;
  hasLetter: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  /** 허용된 ASCII 집합(영문/숫자/특수기호)만으로 구성되어 있고 1자 이상인지 */
  onlyAllowedChars: boolean;
}

export function evaluatePassword(password: string): PasswordRuleStatus {
  return {
    lengthOk: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
    hasLetter: LETTER_PATTERN.test(password),
    hasDigit: DIGIT_PATTERN.test(password),
    hasSpecial: SPECIAL_PATTERN.test(password),
    onlyAllowedChars: ALLOWED_CHARS_PATTERN.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const s = evaluatePassword(password);
  return s.lengthOk && s.hasLetter && s.hasDigit && s.hasSpecial && s.onlyAllowedChars;
}
