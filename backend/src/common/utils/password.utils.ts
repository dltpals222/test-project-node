/**
 * 비밀번호 정책 정규식: 영문 + 숫자 + 특수문자 포함, 8자 이상은 @MinLength 로 별도 강제.
 * DTO 의 @Matches 와 동일 규칙을 코드에서도 재사용할 수 있도록 export.
 */
export const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/;

export const PASSWORD_POLICY_MESSAGE =
  '비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGIT = '0123456789';
const SPECIAL = '!@#$%^&*';

function pick(charset: string): string {
  return charset[Math.floor(Math.random() * charset.length)];
}

/**
 * 12자 임시 비밀번호 생성.
 * 소문자/대문자/숫자/특수문자 각 1개 이상 포함을 보장한 뒤 나머지를 랜덤 채우고 셔플한다.
 */
export function generateTempPassword(length = 12): string {
  const minLength = 4;
  const targetLength = Math.max(length, minLength);

  const guaranteed = [pick(LOWER), pick(UPPER), pick(DIGIT), pick(SPECIAL)];

  const all = LOWER + UPPER + DIGIT + SPECIAL;
  const rest: string[] = [];
  for (let i = guaranteed.length; i < targetLength; i++) {
    rest.push(pick(all));
  }

  const chars = [...guaranteed, ...rest];

  // Fisher-Yates 셔플
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
