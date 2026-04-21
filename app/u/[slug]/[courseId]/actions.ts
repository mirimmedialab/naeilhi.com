'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCourseById } from '@/lib/constants';
import type { Grade } from '@/types';

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
  // 서버 측 유효성 검증 (클라이언트 검증만 신뢰하지 않음)
  if (!data.name?.trim()) return { ok: false, error: '이름을 입력해주세요' };
  if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(data.phone.replace(/\s/g, '')))
    return { ok: false, error: '올바른 전화번호 형식이 아닙니다' };
  if (!/^\S+@\S+\.\S+$/.test(data.email))
    return { ok: false, error: '올바른 이메일 형식이 아닙니다' };
  if (!data.department?.trim()) return { ok: false, error: '학과를 입력해주세요' };
  if (!data.grade) return { ok: false, error: '학년을 선택해주세요' };
  if (typeof data.hasCard !== 'boolean')
    return { ok: false, error: '내일배움카드 보유 여부를 선택해주세요' };

  const course = getCourseById(data.courseId);
  if (!course) return { ok: false, error: '유효하지 않은 과정입니다' };

  const supabase = await createClient();

  // 대학 검증
  const { data: university, error: uniErr } = await supabase
    .from('universities')
    .select('id, name')
    .eq('slug', data.universitySlug)
    .eq('active', true)
    .single();

  if (uniErr || !university) {
    return { ok: false, error: '유효하지 않은 대학입니다' };
  }

  // 신청 생성
  const { data: app, error } = await supabase
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
      grade: data.grade,
      has_card: data.hasCard,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Application submit error:', error);
    // 중복 신청 에러 처리 (unique constraint)
    if (error.code === '23505') {
      return {
        ok: false,
        error: '이미 동일 과정에 신청하신 내역이 있습니다',
      };
    }
    return { ok: false, error: '신청 접수 중 오류가 발생했습니다' };
  }

  // 관리자 대시보드 캐시 갱신
  revalidatePath('/admin/applications');

  return { ok: true, applicationId: app.id };
}
