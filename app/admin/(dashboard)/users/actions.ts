'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  generatePassword,
  buildOperatorEmail,
  buildSuperOperatorEmail,
  buildAdminEmail,
} from '@/lib/credentials';
import type { Role } from '@/types';
import type { User } from '@supabase/supabase-js';

type RequireAdminResult =
  | { error: string }
  | { user: User; profile: { role: Role } };

async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: '인증이 필요합니다' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: '어드민만 접근할 수 있습니다' };
  }
  return { user, profile };
}

/**
 * 계정 생성 결과.
 * 성공 시 자동 생성된 이메일/비밀번호를 포함해서 반환 (1회성 노출용).
 */
export type CreateUserResult =
  | {
      ok: true;
      credentials: {
        email: string;
        password: string;
        role: Role;
        universityName: string | null;
      };
    }
  | { ok: false; error: string };

/**
 * 계정 자동 생성.
 *   - admin          : admin-{timestamp}@naeilhi.com
 *   - super_operator : super-{timestamp}@naeilhi.com
 *   - operator       : {slug}@naeilhi.com (같은 대학 중복 거부)
 */
export async function createUser(data: {
  role: Role;
  universityId?: string | null;
}): Promise<CreateUserResult> {
  const check = await requireAdmin();
  if ('error' in check) return { ok: false, error: check.error };

  const admin = createAdminClient();

  let email: string;
  let universityId: string | null = null;
  let universityName: string | null = null;
  let displayName: string;

  if (data.role === 'operator') {
    if (!data.universityId) {
      return { ok: false, error: '운영자는 소속 대학을 선택해야 합니다' };
    }

    const { data: uni } = await admin
      .from('universities')
      .select('id, slug, name')
      .eq('id', data.universityId)
      .single();

    if (!uni) {
      return { ok: false, error: '선택한 대학을 찾을 수 없습니다' };
    }

    // 같은 대학 중복 체크
    const { data: existing } = await admin
      .from('profiles')
      .select('id, email')
      .eq('role', 'operator')
      .eq('university_id', uni.id)
      .maybeSingle();

    if (existing) {
      return {
        ok: false,
        error: `이미 ${uni.name} 운영자가 존재합니다 (${existing.email}). 관리자에게 비밀번호를 요청하세요.`,
      };
    }

    email = buildOperatorEmail(uni.slug);
    universityId = uni.id;
    universityName = uni.name;
    displayName = uni.name;
  } else if (data.role === 'super_operator') {
    email = buildSuperOperatorEmail();
    displayName = '총괄 운영자';

    // 매우 드문 타임스탬프 충돌 방지
    const { data: dupe } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (dupe) {
      await new Promise((r) => setTimeout(r, 2));
      email = buildSuperOperatorEmail();
    }
  } else {
    // admin
    email = buildAdminEmail();
    displayName = '관리자';

    const { data: dupe } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (dupe) {
      await new Promise((r) => setTimeout(r, 2));
      email = buildAdminEmail();
    }
  }

  const password = generatePassword(12);

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: displayName },
  });

  if (authError || !created.user) {
    return { ok: false, error: authError?.message || '계정 생성 실패' };
  }

  const { error: updateErr } = await admin
    .from('profiles')
    .update({
      role: data.role,
      university_id: universityId,
      name: displayName,
    })
    .eq('id', created.user.id);

  if (updateErr) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => {});
    return { ok: false, error: `프로필 업데이트 실패: ${updateErr.message}` };
  }

  revalidatePath('/admin/users');

  return {
    ok: true,
    credentials: {
      email,
      password,
      role: data.role,
      universityName,
    },
  };
}

/**
 * 비밀번호 재설정 — 새 비밀번호 자동 생성 후 1회성 반환.
 */
export async function resetUserPassword(userId: string): Promise<CreateUserResult> {
  const check = await requireAdmin();
  if ('error' in check) return { ok: false, error: check.error };

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('id, email, role, university_id')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { ok: false, error: '계정을 찾을 수 없습니다' };
  }

  const password = generatePassword(12);

  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { ok: false, error: error.message };

  let universityName: string | null = null;
  if (profile.university_id) {
    const { data: uni } = await admin
      .from('universities')
      .select('name')
      .eq('id', profile.university_id)
      .single();
    universityName = uni?.name || null;
  }

  revalidatePath('/admin/users');

  return {
    ok: true,
    credentials: {
      email: profile.email,
      password,
      role: profile.role as Role,
      universityName,
    },
  };
}

/**
 * 계정 이름만 수정.
 * role/university_id 변경은 지원하지 않음 (삭제 후 재생성이 명확함).
 */
export async function updateUser(
  userId: string,
  data: { name?: string }
) {
  const check = await requireAdmin();
  if ('error' in check) return { ok: false, error: check.error };

  const admin = createAdminClient();

  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name.trim();

  if (Object.keys(update).length > 0) {
    const { error } = await admin.from('profiles').update(update).eq('id', userId);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function deleteUser(userId: string) {
  const check = await requireAdmin();
  if ('error' in check) return { ok: false, error: check.error };

  if (userId === check.user.id) {
    return { ok: false, error: '본인 계정은 삭제할 수 없습니다' };
  }

  const admin = createAdminClient();

  const { data: target } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (target?.role === 'admin') {
    const { count } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    if ((count || 0) <= 1) {
      return { ok: false, error: '마지막 어드민 계정은 삭제할 수 없습니다' };
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/users');
  return { ok: true };
}