// =============================================================================
// 데이터베이스 타입 (Supabase schema에 대응)
// =============================================================================

export type Role = 'admin' | 'operator';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

/**
 * 학년 분류 — 내일배움카드 대상 여부를 가르는 기준.
 * - 4년제 대학: '1-2학년' 또는 '3-4학년' 중 선택
 * - 전문대학: '전문대' (자동 할당, 사용자 입력 없음)
 * - 대학원: '대학원' (자동 할당, 사용자 입력 없음)
 */
export type Grade = '1-2학년' | '3-4학년' | '전문대' | '대학원';

export const GRADES: Grade[] = ['1-2학년', '3-4학년', '전문대', '대학원'];

/**
 * 4년제 대학 학생에게 노출되는 학년 선택 옵션.
 * '전문대' / '대학원'은 자동 할당되므로 UI에 노출하지 않음.
 */
export const FOUR_YEAR_GRADE_OPTIONS: Grade[] = ['1-2학년', '3-4학년'];

/**
 * 내일배움카드 대상자가 아닌 학년 목록.
 * 이 학년에 해당하면 신청 불가(버튼 비활성화 + 안내 노출).
 */
export const INELIGIBLE_GRADES: Grade[] = ['1-2학년'];

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: string;
  slug: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 대학 학제 분류 — code 필드(UNI-4YR-XXX, UNI-JC-XXX, UNI-GR-XXX)에서 파생.
 */
export type UniversityType = 'four-year' | 'junior-college' | 'graduate';

/**
 * University.code에서 학제 타입을 추출하는 헬퍼.
 * code 형식: "UNI-4YR-001" / "UNI-JC-001" / "UNI-GR-001"
 */
export function getUniversityType(code: string): UniversityType {
  if (code.includes('-4YR-')) return 'four-year';
  if (code.includes('-JC-')) return 'junior-college';
  if (code.includes('-GR-')) return 'graduate';
  // 미확인 code는 안전하게 4년제로 간주 (하위호환)
  return 'four-year';
}

export interface Application {
  id: string;
  university_id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  name: string;
  phone: string;
  email: string;
  department: string;
  grade: Grade;
  has_card: boolean;
  status: ApplicationStatus;
  status_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  completed: boolean | null;
  refund_amount: number;
  completed_at: string | null;
  completion_note: string | null;
  applied_at: string;
  updated_at: string;
}

/**
 * applications 조회 시 universities 테이블이 조인된 형태.
 * Supabase의 select('*, universities(id, name)')로 얻은 결과 타입.
 */
export interface ApplicationWithUniversity extends Application {
  universities: {
    id: string;
    name: string;
  } | null;
}

// =============================================================================
// 과정 데이터 (프론트엔드 상수)
// =============================================================================

export interface Certification {
  type: 'microsoft';
  label: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  regularPrice: number;
  userPrice: number;
  sessions: number;
  difficulty: string;
  ncsCode: string;
  ncsCategory: string;
  duration: string;
  instructor: string;
  description: string;
  icon: string; // Lucide icon name
  accent: string;
  gradient: string;
  /**
   * 외부 수강 과정 상세 페이지 URL (hi-d.hightecher.co.kr).
   * 신청 완료 화면에서 사용자가 "수강 과정 상세보기"로 이동할 때 사용.
   */
  externalUrl: string;
  certification?: Certification;
  warning?: string;
  targets: string[];
  objectives: string[];
  benefits: string[];
}

// =============================================================================
// Form 타입
// =============================================================================

export interface ApplicationFormData {
  name: string;
  phone: string;
  email: string;
  department: string;
  grade: Grade | '';
  hasCard: boolean | null;
  agreed: boolean;
}