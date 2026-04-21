import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import UsersClient from './users-client';
import type { Profile } from '@/types';

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

  // 모든 프로필을 가져오기 위해 service_role 사용
  const admin = createAdminClient();
  const { data: users } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return <UsersClient users={(users || []) as Profile[]} currentUserId={user.id} />;
}
