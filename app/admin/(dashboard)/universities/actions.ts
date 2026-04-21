'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function generateSlug(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = 'UNI-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createUniversity(data: {
  name: string;
  slug?: string;
  code?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다' };

  if (!data.name.trim()) return { ok: false, error: '대학명을 입력해주세요' };

  // slug와 code는 없으면 자동 생성 (중복 시 최대 5회 재시도)
  let slug = data.slug?.trim() || generateSlug();
  const code = data.code?.trim() || generateCode();

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, error: 'slug는 영문 소문자, 숫자, 하이픈만 사용 가능합니다' };
  }

  // slug 중복 체크 (자동 생성 시 재시도)
  for (let attempts = 0; attempts < 5; attempts++) {
    const { data: existing } = await supabase
      .from('universities')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!existing) break;
    if (data.slug) return { ok: false, error: '이미 사용중인 slug입니다' };
    slug = generateSlug();
  }

  const { data: created, error } = await supabase
    .from('universities')
    .insert({ name: data.name.trim(), slug, code, active: true })
    .select()
    .single();

  if (error) {
    console.error('createUniversity error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/universities');
  revalidatePath('/');
  return { ok: true, university: created };
}

export async function updateUniversity(
  id: string,
  data: { name?: string; slug?: string; code?: string; active?: boolean }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다' };

  const update: Record<string, any> = {};
  if (data.name !== undefined) update.name = data.name.trim();
  if (data.slug !== undefined) {
    if (!/^[a-z0-9-]+$/.test(data.slug)) {
      return { ok: false, error: 'slug 형식이 올바르지 않습니다' };
    }
    update.slug = data.slug;
  }
  if (data.code !== undefined) update.code = data.code;
  if (data.active !== undefined) update.active = data.active;

  const { error } = await supabase.from('universities').update(update).eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/universities');
  revalidatePath('/');
  return { ok: true };
}

export async function deleteUniversity(id: string) {
  const supabase = await createClient();

  // 해당 대학에 신청이 있는지 확인
  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('university_id', id);

  if ((count || 0) > 0) {
    return {
      ok: false,
      error: `신청 내역이 ${count}건 있어 삭제할 수 없습니다. 비활성화를 사용해주세요.`,
    };
  }

  const { error } = await supabase.from('universities').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/universities');
  return { ok: true };
}
