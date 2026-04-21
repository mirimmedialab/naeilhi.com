import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ApplicationsClient from './applications-client';
import type { ApplicationWithUniversity, University } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const supabase = await createClient();

  // 방어적 인증 체크 (middleware가 이미 보호하지만 이중 방어)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const [{ data: applications }, { data: universities }, { data: profile }] =
    await Promise.all([
      supabase
        .from('applications')
        .select('*, universities(id, name)')
        .order('applied_at', { ascending: false }),
      supabase.from('universities').select('id, name, slug').order('name'),
      supabase.from('profiles').select('role').eq('id', user.id).single(),
    ]);

  return (
    <ApplicationsClient
      applications={(applications || []) as ApplicationWithUniversity[]}
      universities={(universities || []) as Pick<University, 'id' | 'name' | 'slug'>[]}
      isAdmin={profile?.role === 'admin'}
    />
  );
}
