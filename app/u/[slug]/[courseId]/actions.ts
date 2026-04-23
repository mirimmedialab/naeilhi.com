'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getCourseById } from '@/lib/constants';
import {
  INELIGIBLE_GRADES,
  getUniversityType,
  type Grade,
} from '@/types';

export interface ApplicationSubmission {
  universitySlug: string;
  courseId: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  grade: Grade;
  hasCard: boolean;
}

export type SubmitResult =
  | { ok: true; applicationId: string }
  | { ok: false; error: string };

export async function submitApplication(
  data: ApplicationSubmission
): Promise<SubmitResult> {
  // ===== 1. 서버 측 입력 유효성 검증 (보안 핵심) =====
  if (!data.name?.trim()) return { ok: false, error: '이름을 입력해주세요' };
  if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(data.phone.replace(/\s/g, '')))
    return { ok: false, error: '올바른 전화번호 형식이 아닙니다' };
  if (!/^\S+@\S+\.\S+$/.test(data.email))
    return { ok: false, error: '올바른 이메일 형식이 아닙니다' };
  if (!data.department?.trim()) return { ok: false, error: '학과를 입력해주세요' };
  if (typeof data.hasCard !== 'boolean')
    return { ok: false, error: '내일배움카드 보유 여부를 선택해주세요' };

  // ===== 2. 과정 검증 (서버 상수 기준) =====
  const course = getCourseById(data.courseId);
  if (!course) return { ok: false, error: '유효하지 않은 과정입니다' };

  // ===== 3. 대학 검증 (anon client로 조회) =====
  const supabase = await createClient();
  const { data: university, error: uniErr } = await supabase
    .from('universities')
    .select('id, name, code')
    .eq('slug', data.universitySlug)
    .eq('active', true)
    .single();

  if (uniErr || !university) {
    return { ok: false, error: '유효하지 않은 대학입니다' };
  }

  // ===== 4. 학제별 grade 검증 및 정규화 =====
  // - 전문대: grade는 '전문대'로 강제 (클라이언트가 다른 값 보내도 덮어씀)
  // - 대학원: grade는 '대학원'으로 강제
  // - 4년제: 사용자가 선택한 값 유지 ('1-2학년' 또는 '3-4학년')
  const universityType = getUniversityType(university.code);
  let finalGrade: Grade;

  if (universityType === 'junior-college') {
    finalGrade = '전문대';
  } else if (universityType === 'graduate') {
    finalGrade = '대학원';
  } else {
    // 4년제 - 클라이언트에서 받은 값 검증
    if (!data.grade) return { ok: false, error: '학년을 선택해주세요' };
    if (data.grade !== '1-2학년' && data.grade !== '3-4학년') {
      return { ok: false, error: '올바르지 않은 학년 값입니다' };
    }
    // 1-2학년은 내일배움카드 대상자가 아니므로 거부
    if (INELIGIBLE_GRADES.includes(data.grade)) {
      return {
        ok: false,
        error: '내일배움카드 대상자가 아닙니다. 3-4학년부터 신청 가능합니다.',
      };
    }
    finalGrade = data.grade;
  }

  // ===== 5. 신청 생성 (service_role client로 RLS 우회) =====
  // 위 1~4단계에서 모든 입력과 참조 무결성이 검증되었으므로 안전
  const adminClient = createAdminClient();
  const { data: app, error } = await adminClient
    .from('applications')
    .insert({
      university_id: university.id,
      course_id: course.id,
      course_title: course.title,
      course_price: course.userPrice,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      department: data.department.trim(),
      grade: finalGrade,
      has_card: data.hasCard,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Application submit error:', error);

    // 중복 신청 (unique index 위반)
    if (error.code === '23505') {
      return {
        ok: false,
        error: '이미 동일 과정에 신청하신 내역이 있습니다',
      };
    }

    return { ok: false, error: '신청 접수 중 오류가 발생했습니다' };
  }

  // ===== 6. 관리자 대시보드 캐시 갱신 =====
  revalidatePath('/admin/applications');
  revalidatePath('/admin');

  return { ok: true, applicationId: app.id };
}