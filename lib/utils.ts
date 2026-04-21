/**
 * 공통 유틸리티 함수
 */

// 천 단위 콤마 포맷
export const fmt = (n: number): string => n.toLocaleString('ko-KR');

export const fmtDate = (ts: string | number | Date): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const fmtDateTime = (ts: string | number | Date): string => {
  const d = new Date(ts);
  return `${fmtDate(ts)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * 한국 휴대폰 번호 자동 포맷: "01012345678" -> "010-1234-5678"
 */
export function formatPhone(value: string): string {
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/**
 * 월별 필터 헬퍼
 */
export function monthKey(ts: string | number | Date): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(key: string | null): string {
  if (!key) return '전체 기간';
  const [y, m] = key.split('-');
  return `${y}년 ${parseInt(m, 10)}월`;
}

export function monthShort(key: string | null): string {
  if (!key) return '전체';
  const [y, m] = key.split('-');
  return `${y}.${m}`;
}

export function isInMonth(ts: string | number | Date, key: string | null): boolean {
  return !key || monthKey(ts) === key;
}

export function uniqueMonths(timestamps: (string | number | Date)[]): string[] {
  const set = new Set<string>();
  timestamps.forEach((ts) => set.add(monthKey(ts)));
  return [...set].sort().reverse();
}

/**
 * 유효성 검증
 */
export function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Tailwind class 병합 (조건부 스타일링)
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
