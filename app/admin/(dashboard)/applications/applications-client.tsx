'use client';

import { useState, useMemo, useTransition } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Clock3,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  Search,
  X,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { CourseIcon } from '@/components/course-icon';
import { COURSES, STATUS_LABELS } from '@/lib/constants';
import {
  fmt,
  fmtDate,
  fmtDateTime,
  isInMonth,
  monthLabel,
  monthShort,
  uniqueMonths,
  cn,
} from '@/lib/utils';
import type { ApplicationWithUniversity, University, ApplicationStatus } from '@/types';
import {
  updateApplicationStatus,
  deleteApplication,
} from './actions';

type Uni = Pick<University, 'id' | 'name' | 'slug'>;

export default function ApplicationsClient({
  applications,
  universities,
  isAdmin,
}: {
  applications: ApplicationWithUniversity[];
  universities: Uni[];
  isAdmin: boolean;
}) {
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');
  const [uniFilter, setUniFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApplicationWithUniversity | null>(null);

  const monthFiltered = useMemo(
    () => applications.filter((a) => isInMonth(a.applied_at, monthFilter)),
    [applications, monthFilter]
  );

  const filtered = monthFiltered.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (uniFilter !== 'all' && a.university_id !== uniFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.course_title.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: monthFiltered.length,
    pending: monthFiltered.filter((a) => a.status === 'pending').length,
    approved: monthFiltered.filter((a) => a.status === 'approved').length,
    rejected: monthFiltered.filter((a) => a.status === 'rejected').length,
  };

  const handleDownload = () => {
    if (filtered.length === 0) {
      alert('다운로드할 명단이 없습니다');
      return;
    }

    const fileLabel = {
      all: '신청자',
      pending: '대기자',
      approved: '승인자',
      rejected: '반려자',
    }[filter];

    const rows = filtered.map((app, idx) => ({
      번호: idx + 1,
      대학명: app.universities?.name || '',
      이름: app.name,
      학과: app.department || '-',
      학년: app.grade || '-',
      휴대폰: app.phone,
      이메일: app.email,
      내일배움카드: app.has_card ? '보유' : '미보유',
      '신청 과정': app.course_title,
      자부담금: app.course_price,
      상태: STATUS_LABELS[app.status],
      신청일시: fmtDateTime(app.applied_at),
      수료여부: app.completed === true ? '수료' : app.completed === false ? '미수료' : '-',
      환급액: app.refund_amount || 0,
      신청번호: app.id.slice(-10).toUpperCase(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 40 }, { wch: 10 },
      { wch: 8 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${fileLabel}명단`);

    let filename = '';
    if (uniFilter !== 'all') {
      const uni = universities.find((u) => u.id === uniFilter);
      if (uni) filename += `${uni.name}_`;
    }
    filename += `${fileLabel}명단_`;
    if (monthFilter) {
      const [y, m] = monthFilter.split('-');
      filename += `${y}년${m}월`;
    } else {
      filename += fmtDate(Date.now()).replace(/\./g, '');
    }
    filename += '.xlsx';
    XLSX.writeFile(wb, filename);
  };

  const STATUS_FILTERS = [
    { id: 'all' as const, label: '전체', Icon: FileText, active: 'bg-slate-900 text-white border-slate-900', inactive: 'bg-white text-slate-600 border-slate-200 hover:border-slate-300' },
    { id: 'pending' as const, label: '대기', Icon: Clock3, active: 'bg-amber-50 text-amber-700 border-amber-400 ring-4 ring-amber-100', inactive: 'bg-white text-slate-600 border-slate-200 hover:border-amber-200' },
    { id: 'approved' as const, label: '승인', Icon: CheckCircle2, active: 'bg-emerald-50 text-emerald-700 border-emerald-400 ring-4 ring-emerald-100', inactive: 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200' },
    { id: 'rejected' as const, label: '반려', Icon: XCircle, active: 'bg-rose-50 text-rose-700 border-rose-400 ring-4 ring-rose-100', inactive: 'bg-white text-slate-600 border-slate-200 hover:border-rose-200' },
  ];

  const availableMonths = uniqueMonths(applications.map((a) => a.applied_at));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">신청 관리</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {monthFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                <Calendar className="w-3 h-3" />
                {monthLabel(monthFilter)}
              </span>
            )}
            <p className="text-sm text-slate-500">
              총 {fmt(monthFiltered.length)}건 · 조회 중{' '}
              <span className="font-bold text-slate-900">{fmt(filtered.length)}건</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition tap-scale disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="w-4 h-4" />
          명단 다운로드
          <span className="text-[11px] font-bold bg-white/20 px-1.5 py-0.5 rounded ml-1">
            {filtered.length}
          </span>
        </button>
      </div>

      {availableMonths.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 pl-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-semibold">기간</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto scroll-hide flex-1">
            <button
              onClick={() => setMonthFilter(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0',
                !monthFilter
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              전체
            </button>
            {availableMonths.map((m) => (
              <button
                key={m}
                onClick={() => setMonthFilter(m)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0',
                  monthFilter === m
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {monthShort(m)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
        {STATUS_FILTERS.map((s) => {
          const isActive = filter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                'relative py-3 px-2 sm:px-3 rounded-xl border-2 transition tap-scale',
                isActive ? s.active : s.inactive
              )}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <s.Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{s.label}</span>
              </div>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="font-display text-xl sm:text-2xl font-bold leading-none">
                  {counts[s.id]}
                </span>
                <span className={cn('text-[10px] font-medium', isActive ? 'opacity-70' : 'text-slate-400')}>
                  건
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-slate-50 rounded-lg">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 과정명, 연락처 검색..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            )}
          </div>
          <select
            value={uniFilter}
            onChange={(e) => setUniFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none"
          >
            <option value="all">전체 대학</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1">
              {applications.length === 0
                ? '아직 신청 내역이 없습니다'
                : monthFilter && monthFiltered.length === 0
                ? `${monthLabel(monthFilter)}에 신청이 없습니다`
                : '조건에 맞는 신청이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((app) => {
              const course = COURSES.find((c) => c.id === app.course_id);
              return (
                <div
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition flex items-center gap-3"
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${course?.gradient || 'from-slate-400 to-slate-500'} flex items-center justify-center shrink-0`}
                  >
                    {course && <CourseIcon name={course.icon} className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900 truncate">{app.name}</p>
                      <span className="text-xs text-slate-400">
                        · {app.universities?.name || '-'}
                      </span>
                      {app.has_card && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold shrink-0">
                          <CreditCard className="w-2.5 h-2.5" />
                          카드
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{app.course_title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={app.status} />
                    <p className="text-[10px] text-slate-400 mt-1">{fmtDate(app.applied_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          application={selected}
          universityName={selected.universities?.name || ''}
          onClose={() => setSelected(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: '대기', bg: 'bg-amber-50', text: 'text-amber-700' },
    approved: { label: '승인', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    rejected: { label: '반려', bg: 'bg-rose-50', text: 'text-rose-700' },
  };
  const c = config[status] || config.pending;
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}

function DetailModal({
  application,
  universityName,
  onClose,
  isAdmin,
}: {
  application: ApplicationWithUniversity;
  universityName: string;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const course = COURSES.find((c) => c.id === application.course_id);
  const [pending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(application.status);

  const handleStatus = (status: ApplicationStatus) => {
    startTransition(async () => {
      const result = await updateApplicationStatus(application.id, status);
      if (result.ok) {
        setCurrentStatus(status);
      } else {
        alert(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    startTransition(async () => {
      const result = await deleteApplication(application.id);
      if (result.ok) {
        onClose();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-base text-slate-900">신청 상세</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div
            className={`p-4 rounded-xl bg-gradient-to-br ${course?.gradient || 'from-slate-400 to-slate-500'} text-white`}
          >
            <p className="text-[10px] font-semibold opacity-80 mb-1">신청 과정</p>
            <p className="font-bold text-sm leading-snug mb-2">{application.course_title}</p>
            <p className="text-xs opacity-90">{fmt(application.course_price)}원</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500 mb-2 tracking-wider">
              신청자 정보
            </p>
            <dl className="divide-y divide-slate-100 rounded-xl bg-slate-50 px-4">
              <Row label="이름" value={application.name} />
              <Row
                label="소속"
                value={`${universityName} · ${application.department} · ${application.grade}`}
              />
              <Row label="휴대폰" value={application.phone} />
              <Row label="이메일" value={application.email} />
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs text-slate-500">내일배움카드</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold',
                    application.has_card
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {application.has_card ? (
                    <>
                      <CreditCard className="w-3 h-3" />
                      보유
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      미보유
                    </>
                  )}
                </span>
              </div>
              <Row label="신청일시" value={fmtDateTime(application.applied_at)} />
              <Row
                label="신청번호"
                value={application.id.slice(-10).toUpperCase()}
                mono
              />
            </dl>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-500 mb-2 tracking-wider">
              상태 관리
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pending' as const, label: '대기', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { id: 'approved' as const, label: '승인', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { id: 'rejected' as const, label: '반려', color: 'bg-rose-50 text-rose-700 border-rose-200' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStatus(s.id)}
                  disabled={pending}
                  className={cn(
                    'py-2 rounded-lg border text-xs font-bold transition disabled:opacity-50',
                    currentStatus === s.id
                      ? s.color
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {pending && (
              <p className="text-[11px] text-slate-500 mt-2 text-center">저장 중...</p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 px-6 py-4 bg-slate-50 flex gap-2 border-t border-slate-100">
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={pending}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
            >
              삭제
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold tap-scale"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={cn('text-xs font-semibold text-slate-900', mono && 'font-mono')}>
        {value}
      </span>
    </div>
  );
}
