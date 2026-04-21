import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  TrendingUp,
  School,
  Award,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { COURSES } from '@/lib/constants';
import { fmt, fmtDateTime } from '@/lib/utils';
import { CourseIcon } from '@/components/course-icon';
import type { ApplicationWithUniversity } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 역할 체크 - 운영자는 /admin/applications로 리다이렉트
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/admin/applications');
  }

  // 데이터 조회
  const [{ data: applications }, { count: uniCount }] = await Promise.all([
    supabase
      .from('applications')
      .select('*, universities(name)')
      .order('applied_at', { ascending: false }),
    supabase.from('universities').select('*', { count: 'exact', head: true }).eq('active', true),
  ]);

  const apps = (applications || []) as ApplicationWithUniversity[];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayApps = apps.filter((a) => new Date(a.applied_at).getTime() >= today.getTime());
  const pending = apps.filter((a) => a.status === 'pending').length;
  const approved = apps.filter((a) => a.status === 'approved').length;
  const rejected = apps.filter((a) => a.status === 'rejected').length;
  const revenue = apps
    .filter((a) => a.status === 'approved')
    .reduce((s, a) => s + (a.course_price || 0), 0);

  const byCourse: Record<string, number> = {};
  apps.forEach((a) => {
    byCourse[a.course_id] = (byCourse[a.course_id] || 0) + 1;
  });
  const maxCount = Math.max(1, ...Object.values(byCourse));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">대시보드</h1>
        <p className="text-sm text-slate-500">실시간 운영 현황</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="총 신청" value={fmt(apps.length)} unit="건" Icon={FileText} color="blue" />
        <StatCard
          label="오늘 신청"
          value={fmt(todayApps.length)}
          unit="건"
          Icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          label="연계 대학"
          value={fmt(uniCount || 0)}
          unit="곳"
          Icon={School}
          color="violet"
        />
        <StatCard
          label="승인 매출"
          value={fmt(revenue)}
          unit="원"
          Icon={Award}
          color="amber"
          small
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-display font-bold text-base text-slate-900 mb-4">신청 상태</h3>
          <div className="space-y-3">
            <StatusRow label="승인 대기" value={pending} total={apps.length} color="bg-amber-500" />
            <StatusRow
              label="승인 완료"
              value={approved}
              total={apps.length}
              color="bg-emerald-500"
            />
            <StatusRow label="반려" value={rejected} total={apps.length} color="bg-rose-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-base text-slate-900 mb-4">과정별 신청 현황</h3>
          <div className="space-y-2.5">
            {COURSES.map((c) => {
              const count = byCourse[c.id] || 0;
              const pct = (count / maxCount) * 100;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center shrink-0`}
                  >
                    <CourseIcon name={c.icon} className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-medium text-slate-700 truncate">{c.title}</p>
                      <p className="text-xs font-bold text-slate-900 ml-2">{fmt(count)}건</p>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${c.gradient} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base text-slate-900">최근 신청</h3>
          <Link
            href="/admin/applications"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            전체 보기 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {apps.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">아직 신청 내역이 없습니다</div>
        ) : (
          <div className="space-y-2">
            {apps.slice(0, 5).map((app) => {
              const course = COURSES.find((c) => c.id === app.course_id);
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition"
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${course?.gradient || 'from-slate-400 to-slate-600'} flex items-center justify-center shrink-0`}
                  >
                    {course && <CourseIcon name={course.icon} className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {app.name} · {app.universities?.name || '-'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{app.course_title}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={app.status} />
                    <p className="text-[10px] text-slate-400 mt-1">{fmtDateTime(app.applied_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Small components
// ============================================================

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

function StatusRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-900">{fmt(value)}건</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
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
