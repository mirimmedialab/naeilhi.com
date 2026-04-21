// =============================================================================
// 데이터베이스 타입 (Supabase schema에 대응)
// =============================================================================

export type Role = 'admin' | 'operator';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type Grade =
  | '1학년'
  | '2학년'
  | '3학년'
  | '4학년'
  | '5학년 이상'
  | '대학원';

export const GRADES: Grade[] = [
  '1학년',
  '2학년',
  '3학년',
  '4학년',
  '5학년 이상',
  '대학원',
];

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
