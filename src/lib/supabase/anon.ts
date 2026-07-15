import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig, isSupabaseConfigured } from './config';
import type { Database } from '@/types/database';

// Cookie-less anonymous client for public data in server contexts where the
// request cookies are unavailable or irrelevant (sitemap, generateMetadata).
export const createSupabaseAnonClient = () => {
  if (!isSupabaseConfigured()) return null;

  const { url, publishableKey } = getSupabaseConfig();
  return createClient<Database>(url, publishableKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
};
