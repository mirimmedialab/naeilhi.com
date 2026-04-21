'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginAction(
  email: string,
  password: string
): Promise<LoginResult> {
  if (!email || !password) {
    return { ok: false, error: '이메일과 비밀번호를 입력해주세요' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다' };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/admin/login');
}
