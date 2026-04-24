import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CompletionsClient from './completions-client';
import type { ApplicationWithUniversity, University } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CompletionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, university_id')
    .eq('id', user.id)
    .single();

  const role = profile?.role;
  const isAdmin = role === 'admin';
  const isSuperOperator = role === 'super_operator';
  const operatorUniversityId = role === 'operator' ? profile?.university_id : null;

  if (role === 'operator' && !operatorUniversityId) {
    redirect('/admin/login');
  }

  const showAllUniversities = isAdmin || isSuperOperator;

  const [{ data: applications }, { data: universities }] = await Promise.all([
    supabase
      .from('applications')
      .select('*, universities(id, name)')
      .eq('status', 'approved')
      .order('applied_at', { ascending: false }),
    showAllUniversities
      ? supabase.from('universities').select('id, name, slug').order('name')
      : operatorUniversityId
      ? supabase
          .from('universities')
          .select('id, name, slug')
          .eq('id', operatorUniversityId)
      : { data: [] },
  ]);

  return (
    <CompletionsClient
      applications={(applications || []) as ApplicationWithUniversity[]}
      universities={(universities || []) as Pick<University, 'id' | 'name' | 'slug'>[]}
    />
  );
}