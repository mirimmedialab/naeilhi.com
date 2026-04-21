'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ApplicationStatus } from '@/types';

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  note?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다' };

  const { error } = await supabase
    .from('applications')
    .update({
      status,
      status_note: note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId);

  if (error) {
    console.error('updateApplicationStatus error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/applications');
  revalidatePath('/admin/completions');
  revalidatePath('/admin');
  return { ok: true };
}

export async function deleteApplication(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다' };

  // admin 권한 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { ok: false, error: '어드민만 삭제할 수 있습니다' };
  }

  const { error } = await supabase.from('applications').delete().eq('id', applicationId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/applications');
  return { ok: true };
}

export async function updateCompletion(
  applicationId: string,
  updates: {
    completed?: boolean;
    refund_amount?: number;
    completed_at?: string | null;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다' };

  const { error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/completions');
  return { ok: true };
}

export async function bulkUpdateCompletions(
  updates: Array<{ id: string; completed: boolean; refund_amount: number }>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '인증이 필요합니다' };

  const now = new Date().toISOString();
  // 각 레코드 개별 업데이트 (Supabase는 bulk upsert에 제약)
  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from('applications')
        .update({
          completed: u.completed,
          refund_amount: u.refund_amount,
          completed_at: u.completed ? now : null,
        })
        .eq('id', u.id)
    )
  );

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    return {
      ok: false,
      error: `${errors.length}건 업데이트 실패`,
      updated: updates.length - errors.length,
    };
  }

  revalidatePath('/admin/completions');
  return { ok: true, updated: updates.length };
}
