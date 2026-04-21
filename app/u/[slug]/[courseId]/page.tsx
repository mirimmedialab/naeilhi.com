import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  User,
  Award,
} from 'lucide-react';
import { MobileFrame } from '@/components/mobile-frame';
import { CourseIcon } from '@/components/course-icon';
import { MSLogo } from '@/components/ms-logo';
import { createClient } from '@/lib/supabase/server';
import { getCourseById } from '@/lib/constants';
import { fmt } from '@/lib/utils';
import ApplicationForm from './application-form';

export const revalidate = 300;

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; courseId: string }>;
  searchParams: Promise<{ apply?: string }>;
}) {
  const { slug, courseId } = await params;
  const { apply } = await searchParams;

  const supabase = await createClient();
  const { data: university } = await supabase
    .from('universities')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  const course = getCourseById(courseId);

  if (!university || !course) {
    notFound();
  }

  // ?apply=1 일 때 신청 폼 렌더
  if (apply === '1') {
    return (
      <MobileFrame>
        <ApplicationForm
          universitySlug={university.slug}
          universityName={university.name}
          course={course}
        />
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      {/* Hero */}
      <div
        className={`relative bg-gradient-to-br ${course.gradient} text-white px-6 pt-12 pb-10 overflow-hidden`}
      >
        <Link
          href={`/u/${slug}`}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center tap-scale"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative pt-8">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/30">
            <CourseIcon name={course.icon} className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
              {course.difficulty}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm">
              NCS {course.ncsCode}
            </span>
          </div>
          <h1 className="font-display text-xl font-bold leading-tight mb-1.5">{course.title}</h1>
          <p className="text-sm text-white/80">{course.subtitle}</p>
        </div>
      </div>

      {/* Price card */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 border border-slate-100">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 mb-0.5">
                자부담금 (정가 90% 할인)
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-slate-900">
                  {fmt(course.userPrice)}
                </span>
                <span className="text-sm text-slate-500">원</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 mb-0.5">정가</p>
              <p className="text-xs text-slate-400 line-through">{fmt(course.regularPrice)}원</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-slate-100">
            <MetaCell Icon={Clock} label="수강기간" value={course.duration} />
            <MetaCell Icon={BookOpen} label="학습차시" value={`${course.sessions}차시`} border />
            <MetaCell Icon={Smartphone} label="학습방법" value="PC/모바일" />
          </div>
        </div>
      </div>

      {/* MS certification (Copilot only) */}
      {course.certification?.type === 'microsoft' && (
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-slate-900 text-white shadow-xl shadow-slate-900/20">
          <div className="flex h-1.5">
            <div className="flex-1 bg-[#F25022]" />
            <div className="flex-1 bg-[#7FBA00]" />
            <div className="flex-1 bg-[#00A4EF]" />
            <div className="flex-1 bg-[#FFB900]" />
          </div>
          <div className="p-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <MSLogo size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-[0.18em] text-slate-400">
                    MICROSOFT OFFICIAL
                  </p>
                  <p className="text-[11px] font-semibold text-slate-300">
                    {course.certification.subtitle}
                  </p>
                </div>
              </div>
              <h3 className="font-display font-bold text-lg leading-tight mb-2">
                {course.certification.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {course.certification.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {course.certification.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 border border-white/10 backdrop-blur-sm"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-semibold">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {course.warning && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 font-medium">{course.warning}</p>
        </div>
      )}

      {/* Details */}
      <div className="px-6 py-6 space-y-6">
        <Section title="학습대상" accent={course.accent}>
          <ul className="space-y-2">
            {course.targets.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                <span className="text-slate-400 shrink-0">·</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="학습목표" accent={course.accent}>
          <ul className="space-y-2">
            {course.objectives.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                <span
                  className="shrink-0 w-4 h-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center mt-0.5"
                  style={{ background: course.accent + '1A', color: course.accent }}
                >
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="강사 정보" accent={course.accent}>
          <div
            className="p-4 rounded-xl border"
            style={{ background: course.accent + '0A', borderColor: course.accent + '33' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                style={{ color: course.accent }}
              >
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-0.5">담당강사</p>
                <p className="font-bold text-sm" style={{ color: course.accent }}>
                  {course.instructor}
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="수강혜택" accent={course.accent}>
          <div className="space-y-2">
            {course.benefits.map((b, i) => (
              <div key={i} className="flex gap-2 p-3 rounded-xl bg-slate-50 text-sm text-slate-700 leading-relaxed">
                <Award className="w-4 h-4 shrink-0 mt-0.5" style={{ color: course.accent }} />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] text-slate-400 mb-1">NCS 분류</p>
            <p className="font-semibold text-slate-900">{course.ncsCategory}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-[10px] text-slate-400 mb-1">수료기준</p>
            <p className="font-semibold text-slate-900">진도율 80%</p>
          </div>
        </div>
      </div>

      <div className="h-24" />

      {/* Sticky apply bar */}
      <div className="sticky bottom-0 px-4 py-3 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <Link
          href={`/u/${slug}/${course.id}?apply=1`}
          className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${course.gradient} text-white font-bold text-sm tap-scale shadow-lg shadow-slate-200 flex items-center justify-center`}
        >
          {fmt(course.userPrice)}원 · 지금 신청하기
        </Link>
      </div>
    </MobileFrame>
  );
}

function MetaCell({
  Icon,
  label,
  value,
  border,
}: {
  Icon: any;
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <div className={`text-center ${border ? 'border-x border-slate-100' : ''}`}>
      <Icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
      <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full" style={{ background: accent }} />
        <h3 className="font-display font-bold text-base text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}
