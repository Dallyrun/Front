/**
 * 닉네임 규칙:
 * - 2자 이상 12자 이하
 * - 한글 완성형(가-힣) + 영문자(A-Za-z) + 숫자(0-9) 만 허용
 * - 공백 / 특수문자 / 자모(ㄱ-ㅎ, ㅏ-ㅣ) / 이모지 / 전각문자 등 모두 금지
 */

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 12;

const NICKNAME_PATTERN = /^[가-힣A-Za-z0-9]{2,12}$/;

export function isNicknameValid(nickname: string): boolean {
  return NICKNAME_PATTERN.test(nickname);
}
