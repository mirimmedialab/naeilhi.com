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

/**
 * is.gd API를 통해 URL을 단축합니다.
 * - 무료, API 키 불필요
 * - TinyURL과 달리 preview 페이지가 없어 바로 리다이렉트됨
 * - 브라우저에서 직접 호출 시 CORS 차단되므로 서버에서 호출
 * - 실패 시 원본 URL을 그대로 반환 (fallback)
 *
 * Rate limit: IP당 시간당 5회 기본. Vercel 서버리스 공유 IP 환경에서는
 * 실용상 제한 없음. 내부 관리자 용도로 충분.
 */
export async function shortenUrl(
  longUrl: string
): Promise<{ ok: true; shortUrl: string } | { ok: false; error: string; fallbackUrl: string }> {
  // 인증 체크
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: '인증이 필요합니다', fallbackUrl: longUrl };
  }

  // URL 형식 검증
  try {
    new URL(longUrl);
  } catch {
    return { ok: false, error: '올바른 URL이 아닙니다', fallbackUrl: longUrl };
  }

  try {
    // is.gd 단축 API 호출 (10초 타임아웃)
    // format=simple: plain text 응답 (단축 URL만 반환)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`,
      {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        error: '단축 URL 생성에 실패했습니다',
        fallbackUrl: longUrl,
      };
    }

    const shortUrl = (await response.text()).trim();

    // is.gd가 에러 시 'Error: ...' 형식 텍스트를 반환할 수 있음
    if (!shortUrl || shortUrl.toLowerCase().startsWith('error')) {
      return {
        ok: false,
        error: '단축 URL 생성에 실패했습니다',
        fallbackUrl: longUrl,
      };
    }

    // 응답이 https://is.gd/... 형식인지 검증
    try {
      const parsed = new URL(shortUrl);
      if (!parsed.hostname.includes('is.gd')) {
        return {
          ok: false,
          error: '올바르지 않은 단축 URL입니다',
          fallbackUrl: longUrl,
        };
      }
    } catch {
      return {
        ok: false,
        error: '올바르지 않은 단축 URL입니다',
        fallbackUrl: longUrl,
      };
    }

    return { ok: true, shortUrl };
  } catch (err) {
    const errorMsg =
      err instanceof Error && err.name === 'AbortError'
        ? '단축 URL 요청 시간이 초과되었습니다'
        : '단축 URL 서비스 연결에 실패했습니다';
    return { ok: false, error: errorMsg, fallbackUrl: longUrl };
  }
}