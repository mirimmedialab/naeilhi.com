import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UniversitiesClient from './universities-client';
import type { University } from '@/types';

export const dynamic = 'force-dynamic';

export default async function UniversitiesPage() {
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

  const [{ data: universities }, { data: applications }] = await Promise.all([
    supabase.from('universities').select('*').order('created_at', { ascending: false }),
    supabase.from('applications').select('university_id'),
  ]);

  // 대학별 신청 건수 계산
  const counts: Record<string, number> = {};
  (applications || []).forEach((a) => {
    counts[a.university_id] = (counts[a.university_id] || 0) + 1;
  });

  return (
    <UniversitiesClient
      universities={(universities || []) as University[]}
      counts={counts}
    />
  );
}
