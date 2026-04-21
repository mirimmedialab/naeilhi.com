import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, LogOut, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '../login/actions';
import { AdminNav, RoleBadge } from './nav-client';
import type { Role } from '@/types';

/**
 * Route group (dashboard) layout — 인증된 관리자/운영자 전용 레이아웃.
 *
 * /admin/login은 이 layout 바깥(app/admin/login/page.tsx)에 있어
 * 이 layout이 적용되지 않습니다. 따라서 layout이 로그인 페이지를
 * 감싸는 이전 버그(x-pathname 헤더 의존)가 해결됩니다.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Profile 조회 (역할 확인)
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role, email')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // profile 누락 — auth.users는 존재하지만 handle_new_user 트리거 실패 케이스
    redirect('/admin/login');
  }

  const role = profile.role as Role;

  return (
    <div className="min-h-screen bg-slate-50 font-kr">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-slate-900 leading-none">
                관리자 콘솔
              </p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">내일하이 K-디지털</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <RoleBadge role={role} name={profile.name || profile.email} />
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              학생 사이트
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                로그아웃
              </button>
            </form>
          </div>
        </div>

        <AdminNav role={role} />
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">{children}</main>
    </div>
  );
}
