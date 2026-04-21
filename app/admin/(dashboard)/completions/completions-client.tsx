'use client';

import { useState, useMemo, useRef, useTransition } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  CheckCircle2,
  Clock3,
  Wallet,
  Upload,
  FileSpreadsheet,
  Search,
  Calendar,
  AlertCircle,
  CreditCard,
  Award,
  X,
  type LucideIcon,
} from 'lucide-react';
import { CourseIcon } from '@/components/course-icon';
import { COURSES } from '@/lib/constants';
import {
  fmt,
  fmtDate,
  isInMonth,
  monthLabel,
  monthShort,
  uniqueMonths,
  cn,
} from '@/lib/utils';
import type { ApplicationWithUniversity, University } from '@/types';
import { updateCompletion, bulkUpdateCompletions } from '../applications/actions';

type Uni = Pick<University, 'id' | 'name' | 'slug'>;

export default function CompletionsClient({
  applications,
  universities,
}: {
  applications: ApplicationWithUniversity[];
  universities: Uni[];
}) {
  const [uniFilter, setUniFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const monthFiltered = useMemo(
    () => applications.filter((a) => isInMonth(a.applied_at, monthFilter)),
    [applications, monthFilter]
  );

  const filtered = monthFiltered.filter((a) => {
    if (uniFilter !== 'all' && a.university_id !== uniFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.course_title.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = useMemo(() => {
    const list =
      uniFilter === 'all' ? monthFiltered : monthFiltered.filter((a) => a.university_id === uniFilter);
    const completed = list.filter((a) => a.completed === true).length;
    const notCompleted = list.filter((a) => a.completed !== true).length;
    const totalRefund = list
      .filter((a) => a.completed === true)
      .reduce((sum, a) => sum + (Number(a.refund_amount) || 0), 0);
    return { total: list.length, completed, notCompleted, totalRefund };
  }, [monthFiltered, uniFilter]);

  const availableMonths = uniqueMonths(applications.map((a) => a.applied_at));

  const downloadTemplate = () => {
    const targetList =
      uniFilter === 'all' ? monthFiltered : monthFiltered.filter((a) => a.university_id === uniFilter);
    const rows =
      targetList.length > 0
        ? targetList.map((a) => ({
            대학명: a.universities?.name || '',
            이름: a.name,
            과정명: a.course_title,
            휴대폰: a.phone,
            수료여부: a.completed === true ? 'O' : 'X',
            환급액: a.refund_amount || 0,
          }))
        : [
            {
              대학명: '서울대학교',
              이름: '홍길동',
              과정명: 'Microsoft Copilot 프롬프트 엔지니어링',
              휴대폰: '010-1234-5678',
              수료여부: 'O',
              환급액: 38720,
            },
          ];

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 45 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '수료관리');

    let filename = '수료관리_';
    if (uniFilter !== 'all') {
      const uni = universities.find((u) => u.id === uniFilter);
      if (uni) filename += `${uni.name}_`;
    }
    if (monthFilter) {
      const [y, m] = monthFilter.split('-');
      filename += `${y}년${m}월`;
    } else {
      filename += fmtDate(Date.now()).replace(/\./g, '');
    }
    filename += '.xlsx';
    XLSX.writeFile(wb, filename);
  };

  const parseCompleted = (raw: any): boolean | null => {
    const s = String(raw).trim();
    if (/^[oOyY]$|수료|완료|true/i.test(s)) return true;
    if (/^[xXnN]$|미수료|false/i.test(s)) return false;
    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        const matched: any[] = [];
        const unmatched: any[] = [];
        const updates: Array<{ id: string; completed: boolean; refund_amount: number }> = [];

        rows.forEach((row, idx) => {
          const name = String(row['이름'] || '').trim();
          const uniName = String(row['대학명'] || '').trim();
          const courseName = String(row['과정명'] || '').trim();
          const phone = String(row['휴대폰'] || '').replace(/\D/g, '');
          const completionRaw = row['수료여부'];
          const refundRaw = row['환급액'];

          if (!name) {
            unmatched.push({ row: idx + 2, reason: '이름 누락', name: '-' });
            return;
          }

          let candidates = applications.filter((a) => a.name === name);
          if (uniName) {
            const byUni = candidates.filter(
              (a) => a.universities?.name === uniName
            );
            if (byUni.length > 0) candidates = byUni;
          }
          if (courseName && candidates.length > 1) {
            const byCourse = candidates.filter((a) => a.course_title === courseName);
            if (byCourse.length > 0) candidates = byCourse;
          }
          if (phone && candidates.length > 1) {
            const byPhone = candidates.filter(
              (a) => a.phone.replace(/\D/g, '') === phone
            );
            if (byPhone.length > 0) candidates = byPhone;
          }

          if (candidates.length === 0) {
            unmatched.push({ row: idx + 2, reason: '일치자 없음', name });
            return;
          }
          if (candidates.length > 1) {
            unmatched.push({ row: idx + 2, reason: '다중 매칭', name });
            return;
          }

          const completed = parseCompleted(completionRaw);
          if (completed === null) {
            unmatched.push({ row: idx + 2, reason: '수료여부 형식 오류', name });
            return;
          }

          const refund_amount =
            Number(String(refundRaw || 0).replace(/[^\d]/g, '')) || 0;

          updates.push({ id: candidates[0].id, completed, refund_amount });
          matched.push({ name, completed, refund_amount });
        });

        if (updates.length > 0) {
          const result = await bulkUpdateCompletions(updates);
          if (!result.ok) {
            setUploadResult({ error: result.error });
            setUploading(false);
            return;
          }
        }

        setUploadResult({
          matched: matched.length,
          unmatched,
          total: rows.length,
        });
      } catch (err) {
        console.error(err);
        setUploadResult({ error: '파일 처리 중 오류가 발생했습니다' });
      }
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">수료 관리</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {monthFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                <Calendar className="w-3 h-3" />
                {monthLabel(monthFilter)}
              </span>
            )}
            <p className="text-sm text-slate-500">승인된 신청자의 수료 현황과 환급액 관리</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition tap-scale"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            템플릿/내보내기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition tap-scale disabled:opacity-60"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            엑셀 업로드
          </button>
        </div>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="전체 승인자" value={fmt(stats.total)} unit="명" Icon={Users} color="blue" />
        <StatCard label="수료 완료" value={fmt(stats.completed)} unit="명" Icon={CheckCircle2} color="emerald" />
        <StatCard label="미수료" value={fmt(stats.notCompleted)} unit="명" Icon={Clock3} color="amber" />
        <StatCard label="환급액 합계" value={fmt(stats.totalRefund)} unit="원" Icon={Wallet} color="violet" small />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-slate-50 rounded-lg">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 과정명 검색..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
            />
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

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-blue-800 leading-relaxed">
          <strong>엑셀 업로드 형식:</strong>{' '}
          <code className="font-mono">대학명</code>, <code className="font-mono">이름</code>,{' '}
          <code className="font-mono">과정명</code>, <code className="font-mono">휴대폰</code>,{' '}
          <code className="font-mono">수료여부</code> (O/X), <code className="font-mono">환급액</code>
          <br />
          템플릿 다운로드 시 현재 조회된 승인자 명단이 채워진 엑셀이 생성됩니다.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1">
              {applications.length === 0
                ? '아직 승인된 신청이 없습니다'
                : '조건에 맞는 승인자가 없습니다'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((app) => (
              <CompletionRow key={app.id} application={app} />
            ))}
          </div>
        )}
      </div>

      {uploadResult && (
        <UploadResultModal result={uploadResult} onClose={() => setUploadResult(null)} />
      )}
    </div>
  );
}

function CompletionRow({ application }: { application: ApplicationWithUniversity }) {
  const course = COURSES.find((c) => c.id === application.course_id);
  const [completed, setCompleted] = useState(application.completed || false);
  const [refundAmount, setRefundAmount] = useState(application.refund_amount || 0);
  const [refundInput, setRefundInput] = useState(
    application.refund_amount ? fmt(application.refund_amount) : ''
  );
  const [pending, startTransition] = useTransition();

  const toggleCompleted = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    startTransition(async () => {
      const result = await updateCompletion(application.id, {
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      });
      if (!result.ok) {
        setCompleted(!newCompleted);
        alert(result.error);
      }
    });
  };

  const handleRefundChange = (v: string) => {
    const digits = v.replace(/[^\d]/g, '');
    setRefundInput(digits ? fmt(Number(digits)) : '');
  };

  const handleRefundBlur = () => {
    const val = Number(refundInput.replace(/[^\d]/g, '')) || 0;
    if (val !== refundAmount) {
      const prev = refundAmount;
      setRefundAmount(val);
      startTransition(async () => {
        const result = await updateCompletion(application.id, { refund_amount: val });
        if (!result.ok) {
          setRefundAmount(prev);
          setRefundInput(fmt(prev));
          alert(result.error);
        }
      });
    }
  };

  return (
    <div className="px-4 py-3.5 hover:bg-slate-50 transition flex items-center gap-3 flex-wrap sm:flex-nowrap">
      <div
        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${course?.gradient || 'from-slate-400 to-slate-500'} flex items-center justify-center shrink-0`}
      >
        {course && <CourseIcon name={course.icon} className="w-4 h-4 text-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="text-sm font-bold text-slate-900 truncate">{application.name}</p>
          <span className="text-xs text-slate-400">
            · {application.universities?.name || '-'}
          </span>
          {application.has_card && (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold shrink-0">
              <CreditCard className="w-2.5 h-2.5" />
              카드
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 truncate">{application.course_title}</p>
      </div>

      <button
        onClick={toggleCompleted}
        disabled={pending}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border-2 shrink-0 tap-scale disabled:opacity-60',
          completed
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
        )}
      >
        {completed ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            수료
          </>
        ) : (
          <>
            <Clock3 className="w-3.5 h-3.5" />
            미수료
          </>
        )}
      </button>

      <div className="flex items-center gap-1 shrink-0">
        <div className="relative">
          <Wallet className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={refundInput}
            onChange={(e) => handleRefundChange(e.target.value)}
            onBlur={handleRefundBlur}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="w-28 pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="0"
            disabled={pending}
          />
        </div>
        <span className="text-xs text-slate-400">원</span>
      </div>
    </div>
  );
}

function UploadResultModal({ result, onClose }: { result: any; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-base text-slate-900">업로드 결과</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          {result.error ? (
            <div className="flex gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-sm text-rose-700">{result.error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-3 rounded-xl bg-slate-50 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">전체</p>
                  <p className="text-lg font-bold text-slate-900">{result.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-center">
                  <p className="text-[10px] text-emerald-600 mb-1">성공</p>
                  <p className="text-lg font-bold text-emerald-700">{result.matched}</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 text-center">
                  <p className="text-[10px] text-rose-600 mb-1">실패</p>
                  <p className="text-lg font-bold text-rose-700">{result.unmatched.length}</p>
                </div>
              </div>
              {result.unmatched.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-700 mb-2">매칭 실패 내역</p>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {result.unmatched.map((u: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50/50 border border-rose-100"
                      >
                        <span className="text-[10px] font-mono text-rose-500 shrink-0 w-10">
                          #{u.row}행
                        </span>
                        <span className="text-xs text-slate-700 flex-1 truncate">
                          {u.name || '-'}
                        </span>
                        <span className="text-[10px] text-rose-600 shrink-0">{u.reason}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold tap-scale"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  Icon,
  color,
  small,
}: {
  label: string;
  value: string;
  unit: string;
  Icon: LucideIcon;
  color: string;
  small?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-display font-bold text-slate-900 ${small ? 'text-xl' : 'text-2xl'}`}
        >
          {value}
        </span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}
