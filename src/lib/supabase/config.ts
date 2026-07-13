const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
const PLACEHOLDER_KEY = 'supabase-not-configured';

export const getSupabaseConfig = () => ({
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || PLACEHOLDER_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || LOCAL_SUPABASE_URL,
});

export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
