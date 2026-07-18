import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyMintedAccessToken } from '@/lib/auth/mintSupabaseJwt';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/types/database';

type VerificationRequest = {
  action?: 'approve' | 'reject';
  reason?: string;
  startupId?: string;
};

export async function POST(request: Request) {
  if (process.env.ENABLE_DEV_VERIFICATION !== 'true' || process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!accessToken) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    await verifyMintedAccessToken(accessToken);
  } catch {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as VerificationRequest | null;
  if (!body?.startupId || !body.action || !['approve', 'reject'].includes(body.action)) {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 });
  }

  // Ownership through the caller's own token: RLS only exposes owned startups.
  const { url, publishableKey } = getSupabaseConfig();
  const callerClient = createClient<Database>(url, publishableKey, {
    accessToken: async () => accessToken,
  });
  const { data: ownedStartup } = await callerClient
    .from('startups')
    .select('id')
    .eq('id', body.startupId)
    .maybeSingle();
  if (!ownedStartup) return NextResponse.json({ error: 'Startup not found or unauthorized.' }, { status: 404 });

  // Same reviewer path production uses (telegram flow): approving verifies and
  // publishes in one step. Only pending startups are reviewable.
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc('admin_review_startup', {
    decision: body.action,
    reason: body.action === 'reject' ? body.reason || 'Rejected during local QA.' : null,
    reviewer: 'dev-verification-route',
    startup_id: body.startupId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const applied = Boolean(data && typeof data === 'object' && 'applied' in data && data.applied);
  if (!applied) {
    return NextResponse.json({ error: 'Startup is not pending verification.' }, { status: 409 });
  }
  return NextResponse.json({ success: true });
}
