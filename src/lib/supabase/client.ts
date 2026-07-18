'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAccessToken } from '@/lib/auth/tokenBridge';
import { getSupabaseConfig } from './config';
import type { Database } from '@/types/database';

let browserClient: SupabaseClient<Database> | undefined;

// Sessions come from the Privy token exchange, not Supabase Auth: every authed
// request carries the minted JWT the token bridge holds, and signed-out users
// fall back to the anon key (public RLS policies). With `accessToken` set,
// supabase-js disables the supabase.auth API entirely.
export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseConfig();
    browserClient = createClient<Database>(url, publishableKey, {
      accessToken: () => getSupabaseAccessToken(),
    });
  }

  return browserClient;
};
