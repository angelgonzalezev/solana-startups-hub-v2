import { NextResponse } from 'next/server';
import { hasVerifiedSolanaIdentity } from '@/lib/auth/siwsIdentity';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { walletAddress?: string } | null;
  const walletAddress = body?.walletAddress;
  if (!walletAddress || !SOLANA_ADDRESS.test(walletAddress)) {
    return NextResponse.json({ error: 'Invalid Solana wallet address.' }, { status: 400 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  if (!hasVerifiedSolanaIdentity(user.identities, walletAddress)) {
    return NextResponse.json({ error: 'Wallet does not match the authenticated SIWS identity.' }, { status: 403 });
  }

  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
  if (existing) {
    if (existing.wallet_address !== walletAddress) {
      return NextResponse.json({ error: 'This account is already bound to a different wallet.' }, { status: 409 });
    }
    return NextResponse.json({ profile: existing });
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ error: 'Server profile provisioning is not configured.' }, { status: 503 });
  }

  const { data: profile, error: insertError } = await admin
    .from('profiles')
    .insert({ auth_user_id: user.id, wallet_address: walletAddress })
    .select('*')
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 409 });
  return NextResponse.json({ profile }, { status: 201 });
}
