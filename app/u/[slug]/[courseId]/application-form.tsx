'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  BookOpen,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  XCircle,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { formatPhone, fmt, cn } from '@/lib/utils';
import {
  FOUR_YEAR_GRADE_OPTIONS,
  INELIGIBLE_GRADES,
  type Grade,
  type UniversityType,
} from '@/types';
import type { Course } from '@/types';
import { submitApplication } from './actions';

interface Props {
  universitySlug: string;
  universityName: string;
  universityType: UniversityType;
  course: Course;
}

export default function ApplicationForm({
  universitySlug,
  universityName,
  universityType,
  course,
}: Props) {
  // 학제별 초기 grade 값: 4년제는 선택받음, 전문대/대학원은 자동 할당
  const initialGrade: Grade | '' =
    universityType === 'junior-college'
      ? '전문대'
      : universityType === 'graduate'
      ? '대학원'
      : '';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    grade: initialGrade,
    hasCard: null as boolean | null,
    agreed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 학년 선택 UI를 보여주는 조건 (4년제만)
  const showGradeSelector = universityType === 'four-year';

  // 내일배움카드 대상자가 아닌지 판별
  const isIneligible =
    form.grade !== '' && INELIGIBLE_GRADES.includes(form.grade as Grade);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '이름을 입력해주세요';
    if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = '올바른 전화번호를 입력해주세요';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = '올바른 이메일을 입력해주세요';
    if (!form.department.trim()) e.department = '학과를 입력해주세요';
    // 4년제만 학년 선택 검증 (전문대/대학원은 자동 할당되므로 스킵)
    if (showGradeSelector && !form.grade) e.grade = '학년을 선택해주세요';
    if (form.hasCard === null) e.hasCard = '내일배움카드 보유 여부를 선택해주세요';
    if (!form.agreed) e.agreed = '개인정보 수집에 동의해주세요';
    return e;
  };

  const handleSubmit = async () => {
    // 내일배움카드 대상자가 아니면 제출 불가
    if (isIneligible) return;

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    const result = await submitApplication({
      universitySlug,
      courseId: course.id,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      grade: form.grade as Grade,
      hasCard: form.hasCard!,
    });

    if (result.ok) {
      setSubmitted(result.applicationId);
    } else {
      setErrors({ _form: result.error });
      setSubmitting(false);
    }
  };

  // 제출 완료 화면
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={2.5} />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-30" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">신청 완료</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          수강신청이 정상적으로 접수되었습니다.
          <br />
          담당자 확인 후 안내드리겠습니다.
        </p>

        <div className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 mb-6 text-left">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200">
            <span className="text-xs text-slate-500">신청번호</span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {submitted.slice(-10).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-start mb-3 gap-3">
            <span className="text-xs text-slate-500 shrink-0">과정</span>
            <span className="text-xs font-semibold text-slate-900 text-right leading-snug">
              {course.title}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-500">소속</span>
            <span className="text-xs font-semibold text-slate-900">{universityName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">상태</span>
            <span className="text-xs font-semibold text-amber-600">승인 대기중</span>
          </div>
        </div>

        {/* 메인 버튼: 외부 수강 과정 상세 페이지 새 탭으로 열기 */}
        <a
          href={course.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'w-full py-3.5 rounded-xl bg-gradient-to-r text-white font-bold text-sm tap-scale shadow-lg shadow-slate-200 flex items-center justify-center gap-2',
            course.gradient
          )}
        >
          수강 과정 상세보기
        </a>

        {/* 보조 링크: 같은 대학의 다른 과정 둘러보기 */}
        <Link
          href={`/u/${universitySlug}`}
          className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-700 underline underline-offset-2"
        >
          다른 과정 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 z-10">
        <Link
          href={`/u/${universitySlug}/${course.id}`}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center tap-scale"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="font-display font-bold text-base text-slate-900">수강 신청</h1>
      </div>

      <div className="px-6 py-5">
        {/* Course summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
          <p className="text-[10px] font-semibold text-slate-500 mb-2 tracking-wider">신청 과정</p>
          <p className="font-bold text-sm text-slate-900 mb-1 leading-snug">{course.title}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">{universityName}</span>
            <span className="text-slate-300">·</span>
            <span className="font-bold text-slate-900">{fmt(course.userPrice)}원</span>
          </div>
        </div>

        <div className="space-y-4">
          <Field
            label="이름"
            Icon={User}
            required
            value={form.name}
            onChange={(v) => set('name', v)}
            placeholder="홍길동"
            error={errors.name}
          />
          <Field
            label="학과"
            Icon={BookOpen}
            required
            value={form.department}
            onChange={(v) => set('department', v)}
            placeholder="컴퓨터공학과"
            error={errors.department}
          />

          {/* 학년 — 4년제 대학만 표시 */}
          {showGradeSelector && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                학년 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FOUR_YEAR_GRADE_OPTIONS.map((g) => {
                  const active = form.grade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set('grade', g)}
                      className={cn(
                        'py-3 px-3 rounded-xl border-2 text-sm font-semibold transition tap-scale',
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      )}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
              {errors.grade && (
                <p className="text-[11px] text-rose-500 mt-1.5 ml-1 font-medium">{errors.grade}</p>
              )}

              {/* 카드 대상자 아님 안내 */}
              {isIneligible && (
                <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-rose-700 mb-0.5">
                      내일배움카드 대상자가 아닙니다
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <Field
            label="휴대폰"
            Icon={Phone}
            required
            type="tel"
            value={form.phone}
            onChange={(v) => set('phone', formatPhone(v))}
            placeholder="010-1234-5678"
            error={errors.phone}
          />
          <Field
            label="이메일"
            Icon={Mail}
            required
            type="email"
            value={form.email}
            onChange={(v) => set('email', v)}
            placeholder="student@example.ac.kr"
            error={errors.email}
          />

          {/* 내일배움카드 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              내일배움카드 보유 여부 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set('hasCard', true)}
                className={cn(
                  'py-3 px-3 rounded-xl border-2 text-sm font-semibold transition tap-scale flex items-center justify-center gap-2',
                  form.hasCard === true
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                )}
              >
                {form.hasCard === true ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                보유
              </button>
              <button
                type="button"
                onClick={() => set('hasCard', false)}
                className={cn(
                  'py-3 px-3 rounded-xl border-2 text-sm font-semibold transition tap-scale flex items-center justify-center gap-2',
                  form.hasCard === false
                    ? 'border-slate-700 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                )}
              >
                {form.hasCard === false ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                미보유
              </button>
            </div>
            {errors.hasCard && (
              <p className="text-[11px] text-rose-500 mt-1.5 ml-1 font-medium">
                {errors.hasCard}
              </p>
            )}
            <div className="flex gap-2 mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                내일배움카드는 고용노동부 직업능력개발 지원 카드이며, 발급은 무료입니다.
              </p>
            </div>
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div className="pt-0.5">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => set('agreed', e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 mb-0.5">
                개인정보 수집·이용 동의 <span className="text-rose-500">*</span>
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                수강신청을 위한 개인정보(이름, 연락처, 이메일, 학과, 학년, 내일배움카드 보유여부) 수집에
                동의합니다. 수집된 정보는 수강신청 처리 및 안내 목적으로만 사용됩니다.{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener"
                  className="text-blue-600 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  자세히
                </a>
              </p>
              {errors.agreed && (
                <p className="text-[11px] text-rose-500 mt-1.5 font-medium">{errors.agreed}</p>
              )}
            </div>
          </label>

          {errors._form && (
            <div className="flex gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700">{errors._form}</p>
            </div>
          )}
        </div>
      </div>

      <div className="h-24" />

      {/* Sticky submit bar */}
      <div className="sticky bottom-0 px-4 py-3 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <button
          onClick={handleSubmit}
          disabled={submitting || isIneligible}
          className={cn(
            'w-full py-3.5 rounded-xl text-white font-bold text-sm tap-scale shadow-lg shadow-slate-200 flex items-center justify-center gap-2 transition',
            isIneligible
              ? 'bg-slate-300 cursor-not-allowed'
              : cn('bg-gradient-to-r disabled:opacity-60', course.gradient)
          )}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              신청 중...
            </>
          ) : isIneligible ? (
            <>신청 불가</>
          ) : (
            <>신청서 제출</>
          )}
        </button>
      </div>
    </>
  );
}

// 폼 필드
function Field({
  label,
  Icon,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  label: string;
  Icon: LucideIcon;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div
        className={cn(
          'relative flex items-center rounded-xl border transition',
          error
            ? 'border-rose-300 bg-rose-50/30'
            : 'border-slate-200 bg-white',
          'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
        )}
      >
        <Icon className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      {error && <p className="text-[11px] text-rose-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
}