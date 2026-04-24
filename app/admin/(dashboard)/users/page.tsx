import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import UsersClient from './users-client';
import type { Profile, University } from '@/types';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (me?.role !== 'admin') {
    redirect('/admin/applications');
  }

  const admin = createAdminClient();
  const [{ data: users }, { data: universities }] = await Promise.all([
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin
      .from('universities')
      .select('id, name, slug, code, active, created_at, updated_at')
      .order('name'),
  ]);

  return (
    <UsersClient
      users={(users || []) as Profile[]}
      universities={(universities || []) as University[]}
      currentUserId={user.id}
    />
  );
}