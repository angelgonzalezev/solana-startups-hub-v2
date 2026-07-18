import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isJwtMintingConfigured, mintSupabaseAccessToken } from '@/lib/auth/mintSupabaseJwt';
import {
  extractSolanaWallets,
  getPrivyUser,
  isPrivyServerConfigured,
  verifyPrivyAccessToken,
  type PrivySolanaWallet,
} from '@/lib/auth/privyServer';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isProfileRow } from '@/lib/supabase/mappers';

// The token exchange at the heart of Privy-as-identity: the client proves who
// it is with a Privy access token, resolve_privy_profile finds (or creates,
// or adopts) the matching profile and syncs the linked-wallet payer set, and
// the response carries a short-lived Supabase-signed JWT whose sub is the
// profile id. Every Supabase query the client makes runs under that token, so
// RLS authorizes exactly as it did under Supabase Auth.
//
// The client re-calls this on session restore and after linking/unlinking
// accounts, which keeps user_wallets mirroring Privy.

const WALLET_CONFLICT = 'This wallet is already linked to another account.';

export async function POST(request: Request) {
  if (!isPrivyServerConfigured() || !isJwtMintingConfigured()) {
    return NextResponse.json({ error: 'Privy session exchange is not configured.' }, { status: 503 });
  }

  const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!accessToken) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let did: string;
  let expiration: number;
  try {
    ({ did, expiration } = await verifyPrivyAccessToken(accessToken));
  } catch (verifyError) {
    console.error('[auth/session] Privy token verification failed:', verifyError);
    return NextResponse.json({ error: 'Invalid or expired Privy session.' }, { status: 401 });
  }

  let wallets: PrivySolanaWallet[];
  try {
    const identityToken = (await cookies()).get('privy-id-token')?.value ?? null;
    wallets = extractSolanaWallets(await getPrivyUser(did, identityToken));
    if (wallets.length === 0 && identityToken) {
      // The identity-token cookie can lag behind embedded wallet creation;
      // the REST lookup is the fresh source before concluding "no wallet".
      wallets = extractSolanaWallets(await getPrivyUser(did, null));
    }
  } catch (userError) {
    console.error('[auth/session] Privy user lookup failed:', userError);
    return NextResponse.json({ error: 'Unable to load the Privy account.' }, { status: 502 });
  }
  if (wallets.length === 0) {
    // Usually transient: the embedded wallet is still being created right
    // after signup. The client retries on this status.
    console.warn('[auth/session] user has no Solana wallets yet:', did);
    return NextResponse.json({ error: 'The account has no Solana wallet yet.' }, { status: 422 });
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ error: 'Server profile provisioning is not configured.' }, { status: 503 });
  }

  const { data: profile, error } = await admin.rpc('resolve_privy_profile', {
    in_did: did,
    in_wallets: wallets.map((wallet) => ({ address: wallet.address, wallet_type: wallet.walletType })),
  });

  if (error) {
    if (error.message.includes('wallet_already_linked')) {
      return NextResponse.json({ error: WALLET_CONFLICT }, { status: 409 });
    }
    console.error('resolve_privy_profile failed', error);
    return NextResponse.json({ error: 'Unable to resolve the profile.' }, { status: 500 });
  }
  if (!isProfileRow(profile)) {
    return NextResponse.json({ error: 'Unable to resolve the profile.' }, { status: 500 });
  }

  const { expiresAt, token } = await mintSupabaseAccessToken({
    privyDid: did,
    privyExpiration: expiration,
    profileId: profile.id,
  });

  return NextResponse.json({ expiresAt, profile, token });
}
