import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { mapProfileRow } from '@/lib/supabase/mappers';
import { validateProfile } from '@/utils/validation';
import type { User } from '@/interface/user';

export const userService = {
  getCurrentUser: async (): Promise<User | null> => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).maybeSingle();
    if (error) throw error;
    return data ? mapProfileRow(data) : null;
  },

  getUserByWallet: async (walletAddress: string): Promise<User | null> => {
    const { data, error } = await getSupabaseBrowserClient()
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) throw error;
    return data ? mapProfileRow(data) : null;
  },

  upsertProfile: async (input: Partial<User>): Promise<User> => {
    const errors = validateProfile(input);
    if (errors.length > 0) throw new Error(errors[0].message);

    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Authentication required.');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar: input.avatar || null,
        bio: input.bio || null,
        display_name: input.displayName || '',
        job_title: input.jobTitle || '',
        telegram_handle: input.telegramHandle || null,
        twitter_handle: input.twitterHandle || null,
      })
      .eq('auth_user_id', user.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapProfileRow(data);
  },
};
