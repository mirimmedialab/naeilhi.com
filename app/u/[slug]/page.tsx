import Link from 'next/link';
import { notFound } from 'next/navigation';
import { School, CheckCircle2 } from 'lucide-react';
import { MobileFrame } from '@/components/mobile-frame';
import { CourseIcon } from '@/components/course-icon';
import { MSLogo } from '@/components/ms-logo';
import { createClient } from '@/lib/supabase/server';
import { COURSES } from '@/lib/constants';
import { fmt } from '@/lib/utils';

export const revalidate = 300; // 5분 캐시

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('universities')
    .select('name')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  return {
    title: `${data?.name || '대학'} K-디지털 기초역량훈련`,
    description: `${data?.name} 재학생 전용 K-디지털 기초역량훈련 신청 페이지`,
  };
}

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: university } = await supabase
    .from('universities')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!university) {
    notFound();
  }

  return (
    <MobileFrame>
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white px-6 pt-12 pb-8 overflow-hidden">
        <div className="absolute top-4 right-4 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-blue-100">{university.code}</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">{university.name}</h1>
          <p className="text-sm text-blue-100 mb-5">K-디지털 기초역량훈련 전용관</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium">신청 접수중</span>
          </div>
        </div>
      </div>

      {/* Section intro */}
      <div className="px-6 py-6 border-b border-slate-100">
        <p className="text-[11px] font-semibold text-blue-600 mb-1 tracking-wider">COURSES</p>
        <h2 className="font-display text-lg font-bold text-slate-900 mb-1">6개 훈련과정</h2>
        <p className="text-xs text-slate-500">관심있는 과정을 선택해 바로 신청하세요</p>
      </div>

      {/* Course cards */}
      <div className="px-4 py-4 space-y-3">
        {COURSES.map((course, idx) => (
          <Link
            key={course.id}
            href={`/u/${university.slug}/${course.id}`}
            className="block bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 hover:shadow-md transition tap-scale"
            style={{ animation: `slide-up 0.4s ease-out ${idx * 50}ms both` }}
          >
            <div className="flex gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <CourseIcon name={course.icon} className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {course.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-400">·</span>
                  <span className="text-[10px] text-slate-500">{course.sessions}차시</span>
                </div>
                <h3 className="font-bold text-[14px] text-slate-900 leading-snug mb-1 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">{course.subtitle}</p>
                {course.certification?.type === 'microsoft' && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md mb-2 bg-slate-900">
                    <MSLogo size={10} />
                    <span className="text-[10px] font-bold text-white tracking-tight">
                      {course.certification.label}
                    </span>
                  </div>
                )}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through mr-1.5">
                      {fmt(course.regularPrice)}원
                    </span>
                    <span className="text-[13px] font-bold text-slate-900">
                      {fmt(course.userPrice)}원
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">자부담 10%</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="px-6 py-6 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <p className="text-xs font-semibold text-slate-700">고용노동부 공식 인증</p>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          모든 과정은 고용노동부 K-디지털 기초역량훈련 인증 과정으로,
          <br />
          수료 시 공식 수료증이 발급됩니다.
        </p>
      </div>

      <div className="h-6" />
    </MobileFrame>
  );
}
