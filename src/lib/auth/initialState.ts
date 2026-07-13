import { mapProfileRow } from '@/lib/supabase/mappers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { InitialAuthState } from '@/context/AuthContext';

export const getInitialAuthState = async (): Promise<InitialAuthState> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { profile: null, resolved: true, walletAddress: null };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { profile: null, resolved: true, walletAddress: null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: null, resolved: true, walletAddress: null };

  const { data: profile } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).maybeSingle();
  return {
    profile: profile ? mapProfileRow(profile) : null,
    resolved: true,
    walletAddress: profile?.wallet_address || null,
  };
};
