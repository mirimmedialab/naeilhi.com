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

  const [{ data: applications }, { data: universities }] = await Promise.all([
    supabase
      .from('applications')
      .select('*, universities(id, name)')
      .eq('status', 'approved')
      .order('applied_at', { ascending: false }),
    supabase.from('universities').select('id, name, slug').order('name'),
  ]);

  return (
    <CompletionsClient
      applications={(applications || []) as ApplicationWithUniversity[]}
      universities={(universities || []) as Pick<University, 'id' | 'name' | 'slug'>[]}
    />
  );
}
