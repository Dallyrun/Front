/**
 * 비밀번호 규칙 (Backend 와 동일):
 * - 8자 이상 30자 이하
 * - 영문자(대소문자 무관) 포함
 * - 숫자 포함
 * - ASCII 특수기호 포함 (! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~)
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 30;

const LETTER_PATTERN = /[A-Za-z]/;
const DIGIT_PATTERN = /\d/;
// prettier-ignore
const SPECIAL_PATTERN = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~\\]/;

export interface PasswordRuleStatus {
  lengthOk: boolean;
  hasLetter: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
}

export function evaluatePassword(password: string): PasswordRuleStatus {
  return {
    lengthOk: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
    hasLetter: LETTER_PATTERN.test(password),
    hasDigit: DIGIT_PATTERN.test(password),
    hasSpecial: SPECIAL_PATTERN.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const s = evaluatePassword(password);
  return s.lengthOk && s.hasLetter && s.hasDigit && s.hasSpecial;
}
