import { cookies } from 'next/headers';
import { isPrivyServerConfigured, verifyPrivyAccessToken } from '@/lib/auth/privyServer';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isProfileRow, mapProfileRow } from '@/lib/supabase/mappers';
import type { InitialAuthState } from '@/context/AuthContext';

const UNAUTHENTICATED: InitialAuthState = { profile: null, resolved: true, walletAddress: null };

// Server-side auth hydration from the privy-token cookie (requires the
// "HTTP-only cookies" setting in the Privy dashboard). Absence or failure is
// never fatal: the client reconciles once the Privy SDK is ready, this just
// removes the flash of signed-out UI on reload.
export const getInitialAuthState = async (): Promise<InitialAuthState> => {
  if (!isPrivyServerConfigured()) return UNAUTHENTICATED;

  try {
    const token = (await cookies()).get('privy-token')?.value;
    if (!token) return UNAUTHENTICATED;

    const { did } = await verifyPrivyAccessToken(token);
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin.rpc('get_profile_by_privy_did', { in_did: did });
    if (!isProfileRow(profile)) return UNAUTHENTICATED;

    return { profile: mapProfileRow(profile), resolved: true, walletAddress: profile.wallet_address };
  } catch {
    return UNAUTHENTICATED;
  }
};
