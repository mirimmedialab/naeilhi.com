import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CourseIcon } from '@/components/course-icon';
import { COURSES } from '@/lib/constants';
import { fmt } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const supabase = await createClient();
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

  const { data: applications } = await supabase.from('applications').select('course_id');
  const counts: Record<string, number> = {};
  (applications || []).forEach((a) => {
    counts[a.course_id] = (counts[a.course_id] || 0) + 1;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">과정 정보</h1>
        <p className="text-sm text-slate-500">
          K-디지털 기초역량훈련 6개 과정 · 과정 데이터는{' '}
          <code className="font-mono text-slate-600">lib/constants.ts</code>에서 관리
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {COURSES.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition"
          >
            <div
              className={`h-24 bg-gradient-to-br ${c.gradient} relative overflow-hidden flex items-end p-4`}
            >
              <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <CourseIcon name={c.icon} className="w-5 h-5 text-white" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
              <p className="relative text-[10px] font-mono text-white/80">NCS {c.ncsCode}</p>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm text-slate-900 leading-snug mb-1 line-clamp-2">
                {c.title}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">{c.subtitle}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400">자부담금</p>
                  <p className="text-sm font-bold text-slate-900">{fmt(c.userPrice)}원</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">총 신청</p>
                  <p className="text-sm font-bold text-slate-900">{fmt(counts[c.id] || 0)}건</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
