'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, UserCog, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginAction } from './actions';

// useSearchParams를 사용하는 내부 컴포넌트
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setErr('이메일과 비밀번호를 입력해주세요');
      return;
    }
    setSubmitting(true);
    const result = await loginAction(email, password);
    if (result.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setErr(result.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      <div className="text-center mb-8">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">관리자 콘솔</h1>
        <p className="text-sm text-slate-400">내일하이 K-디지털 운영 시스템</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">이메일</label>
            <div className="relative flex items-center">
              <UserCog className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErr('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="admin@example.com"
                type="email"
                autoFocus
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">비밀번호</label>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErr('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-300"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-300">{err}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm tap-scale shadow-lg shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          로그인
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-slate-500">
        계정은 어드민이 <code className="text-slate-300 font-mono">Supabase Dashboard</code>에서 발급합니다
      </p>

      <Link
        href="/"
        className="block w-full mt-4 py-2 text-xs text-slate-500 hover:text-slate-300 text-center"
      >
        ← 학생 사이트로 돌아가기
      </Link>
    </div>
  );
}

// Suspense fallback 컴포넌트
function LoginLoading() {
  return (
    <div className="w-full max-w-md relative">
      <div className="text-center mb-8">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">관리자 콘솔</h1>
        <p className="text-sm text-slate-400">로딩 중...</p>
      </div>
    </div>
  );
}

// 최상위 페이지 — Suspense boundary로 감싸기
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-kr flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

      <Suspense fallback={<LoginLoading />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}