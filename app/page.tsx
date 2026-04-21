import Link from 'next/link';
import { Sparkles, Building2, Smartphone, Award, Lock, ChevronRight } from 'lucide-react';
import { MobileFrame } from '@/components/mobile-frame';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // 1분 캐시

export default async function HomePage() {
  const supabase = await createClient();
  const { data: universities } = await supabase
    .from('universities')
    .select('slug, name, code')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <MobileFrame>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white px-6 pt-14 pb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">K-Digital Training</span>
          </div>
          <h1 className="font-display text-[32px] font-bold leading-tight mb-3 tracking-tight">
            내일하이
            <br />
            <span className="text-blue-300">K-디지털 기초역량</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            고용노동부 공식 인증 · 자부담 10%로
            <br />
            핵심 디지털 역량을 키워보세요
          </p>
        </div>
      </div>

      <div className="px-6 py-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">이용 안내</h2>
        <div className="space-y-3 mb-8">
          <InfoRow
            icon={<Building2 className="w-4 h-4 text-blue-600" />}
            title="대학별 전용 URL"
            desc="소속 대학에서 제공한 전용 링크로 접속해주세요"
            color="bg-blue-50"
          />
          <InfoRow
            icon={<Smartphone className="w-4 h-4 text-emerald-600" />}
            title="모바일 간편 신청"
            desc="스마트폰 하나로 원하는 과정을 바로 신청"
            color="bg-emerald-50"
          />
          <InfoRow
            icon={<Award className="w-4 h-4 text-amber-600" />}
            title="공식 수료증 발급"
            desc="고용노동부 인증 수료증으로 커리어 강화"
            color="bg-amber-50"
          />
        </div>

        {universities && universities.length > 0 && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mb-6">
            <p className="text-xs text-slate-500 mb-2">연계 대학 바로가기</p>
            <div className="space-y-2">
              {universities.map((u) => (
                <Link
                  key={u.slug}
                  href={`/u/${u.slug}`}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition tap-scale"
                >
                  <span className="text-sm font-medium text-slate-900">{u.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/admin"
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <Lock className="w-4 h-4" />
          관리자 로그인
        </Link>
      </div>

      <div className="px-6 pb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3 text-[11px] text-slate-500">
          <Link href="/privacy" className="hover:text-blue-600 transition">
            개인정보처리방침
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/terms" className="hover:text-blue-600 transition">
            서비스 이용약관
          </Link>
        </div>
        <p className="text-[11px] text-slate-400">© 2026 내일하이 · K-디지털 기초역량훈련</p>
      </div>
    </MobileFrame>
  );
}

function InfoRow({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0 mt-0.5`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm mb-0.5">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
