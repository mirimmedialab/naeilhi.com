'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Role } from '@/types';

async function requireAdmin() {
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

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: Role;
}) {
  const check = await requireAdmin();
  if ('error' in check) return { ok: false, error: check.error };

  if (!data.email || !data.password || data.password.length < 8) {
    return { ok: false, error: '이메일과 8자 이상의 비밀번호를 입력해주세요' };
  }

  // service_role 클라이언트로 사용자 생성 (이메일 확인 건너뛰기)
  const admin = createAdminClient();
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: data.email.trim(),
    password: data.password,
    email_confirm: true,
    user_metadata: { name: data.name.trim() },
  });

  if (authError || !created.user) {
    return { ok: false, error: authError?.message || '계정 생성 실패' };
  }

  // profile은 트리거로 자동 생성됨. role, name을 업데이트
  await admin
    .from('profiles')
    .update({ name: data.name.trim(), role: data.role })
    .eq('id', created.user.id);

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function updateUser(
  userId: string,
  data: { name?: string; role?: Role; password?: string }
) {
  const check = await requireAdmin();
  if ('error' in check) return { ok: false, error: check.error };

  const admin = createAdminClient();

  if (data.password) {
    if (data.password.length < 8) {
      return { ok: false, error: '비밀번호는 8자 이상' };
    }
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: data.password,
    });
    if (error) return { ok: false, error: error.message };
  }

  const update: Record<string, any> = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.role !== undefined) update.role = data.role;

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

  // 마지막 admin 체크
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

  // auth.users 삭제 → profiles는 CASCADE로 자동 삭제
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/users');
  return { ok: true };
}
