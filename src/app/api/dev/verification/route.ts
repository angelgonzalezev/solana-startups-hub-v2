import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type VerificationRequest = {
  action?: 'approve' | 'reject';
  reason?: string;
  startupId?: string;
};

export async function POST(request: Request) {
  if (process.env.ENABLE_DEV_VERIFICATION !== 'true' || process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as VerificationRequest | null;
  if (!body?.startupId || !body.action || !['approve', 'reject'].includes(body.action)) {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 });
  }

  const { data: ownedStartup } = await supabase.from('startups').select('id').eq('id', body.startupId).maybeSingle();
  if (!ownedStartup) return NextResponse.json({ error: 'Startup not found or unauthorized.' }, { status: 404 });

  const admin = createSupabaseAdminClient();
  const approved = body.action === 'approve';
  const { error } = await admin
    .from('startups')
    .update({
      domain_verification_status: approved ? 'verified' : 'failed',
      verification_rejection_reason: approved ? null : body.reason || 'Rejected during local QA.',
      verification_status: approved ? 'verified' : 'rejected',
      x_verification_status: approved ? 'verified' : 'failed',
    })
    .eq('id', body.startupId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
