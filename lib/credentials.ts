/**
 * 운영자/관리자 계정 자동 생성 유틸리티
 *
 * 이메일 규칙:
 *   - operator       : {universitySlug}@naeilhi.com
 *   - super_operator : super-{timestamp}@naeilhi.com
 *   - admin          : admin-{timestamp}@naeilhi.com
 *
 * 비밀번호 규칙:
 *   - 12자
 *   - 대문자/소문자/숫자/특수문자 각 최소 1자 포함
 *   - 혼동 문자 제외 (0/O, 1/l/I)
 *   - crypto.getRandomValues로 암호학적으로 안전한 난수 사용
 */

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';   // I, O 제외
const LOWERCASE = 'abcdefghjkmnpqrstuvwxyz';    // i, l, o 제외
const DIGITS = '23456789';                      // 0, 1 제외
const SPECIALS = '!@#$%^&*-_=+';

export const EMAIL_DOMAIN = 'naeilhi.com';

export function generatePassword(length: number = 12): string {
  if (length < 8) throw new Error('비밀번호는 최소 8자 이상이어야 합니다');

  const allChars = UPPERCASE + LOWERCASE + DIGITS + SPECIALS;
  const required = [
    pickRandomChar(UPPERCASE),
    pickRandomChar(LOWERCASE),
    pickRandomChar(DIGITS),
    pickRandomChar(SPECIALS),
  ];

  const rest: string[] = [];
  for (let i = required.length; i < length; i++) {
    rest.push(pickRandomChar(allChars));
  }

  const combined = [...required, ...rest];
  shuffleInPlace(combined);
  return combined.join('');
}

export function buildOperatorEmail(universitySlug: string): string {
  return `${universitySlug}@${EMAIL_DOMAIN}`;
}

export function buildSuperOperatorEmail(): string {
  const suffix = Date.now().toString(36).slice(-6);
  return `super-${suffix}@${EMAIL_DOMAIN}`;
}

export function buildAdminEmail(): string {
  const suffix = Date.now().toString(36).slice(-6);
  return `admin-${suffix}@${EMAIL_DOMAIN}`;
}

// -----------------------------------------------------------------------------
// 내부 헬퍼
// -----------------------------------------------------------------------------
function pickRandomChar(charset: string): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return charset[arr[0] % charset.length];
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const rand = new Uint32Array(1);
    crypto.getRandomValues(rand);
    const j = rand[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}