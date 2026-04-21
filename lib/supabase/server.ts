import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}
/**
 * Server Component / Server Action / Route Handler에서 사용하는
 * 기본 Supabase 클라이언트. 사용자 세션 쿠키를 읽어 auth.uid()에 반영.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시 (middleware가 세션 갱신 담당)
          }
        },
      },
    }
  );
}

/**
 * service_role 키로 만든 관리자 클라이언트 — RLS를 우회합니다.
 * 반드시 서버에서 관리자 권한이 확인된 후에만 사용해야 합니다.
 *
 * 이 클라이언트는 클라이언트 컴포넌트로 절대 노출되어서는 안 됩니다.
 * (SUPABASE_SERVICE_ROLE_KEY는 NEXT_PUBLIC_ 접두사가 없어 번들에 포함되지 않음)
 */
export function createAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다. ' +
        '관리자 기능을 사용하려면 이 키를 설정해주세요.'
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
