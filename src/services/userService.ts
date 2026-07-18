import { getAuthenticatedProfileId } from '@/lib/auth/tokenBridge';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isPublicProfileRow, mapProfileRow } from '@/lib/supabase/mappers';
import { validateProfile } from '@/utils/validation';
import type { User } from '@/interface/user';
import { KEEP_MEDIA, type MediaMutation } from '@/interface/media';
import { mediaService } from '@/services/mediaService';

const cleanupReplacedMedia = async (path?: string | null) => {
  try {
    await mediaService.deleteManagedObject(path);
  } catch (error) {
    console.error('Unable to remove replaced profile media:', error);
  }
};

export const userService = {
  getCurrentUser: async (): Promise<User | null> => {
    const profileId = await getAuthenticatedProfileId();
    if (!profileId) return null;

    const { data, error } = await getSupabaseBrowserClient()
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .maybeSingle();
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

  // Works without a session: backs the public /u/<wallet> profile page.
  getPublicProfile: async (walletAddress: string): Promise<User | null> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('get_public_profile', {
      wallet: walletAddress,
    });

    if (error) throw error;
    return isPublicProfileRow(data) ? mapProfileRow(data) : null;
  },

  // Works without a session: backs the public /<username> profile page.
  getPublicProfileByUsername: async (username: string): Promise<User | null> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('get_public_profile_by_username', {
      name: username,
    });

    if (error) throw error;
    return isPublicProfileRow(data) ? mapProfileRow(data) : null;
  },

  // Works without a session: the detail page is public, so the owner and team
  // profiles come from an RPC scoped to one startup instead of the profiles table.
  listStartupTeamProfiles: async (startupId: string): Promise<User[]> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('get_startup_team_profiles', {
      startup_id: startupId,
    });

    if (error) throw error;
    return (data || []).flatMap((row) => (isPublicProfileRow(row) ? [mapProfileRow(row)] : []));
  },

  listUsersByWallets: async (walletAddresses: string[]): Promise<User[]> => {
    const uniqueWallets = Array.from(new Set(walletAddresses)).filter(Boolean);
    if (uniqueWallets.length === 0) return [];

    const { data, error } = await getSupabaseBrowserClient()
      .from('profiles')
      .select('*')
      .in('wallet_address', uniqueWallets);

    if (error) throw error;
    return (data || []).map(mapProfileRow);
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const search = query.trim();
    if (search.length < 2) return [];

    const [nameResult, walletResult] = await Promise.all([
      getSupabaseBrowserClient()
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${search}%`)
        .order('display_name', { ascending: true })
        .limit(8),
      getSupabaseBrowserClient()
        .from('profiles')
        .select('*')
        .ilike('wallet_address', `%${search}%`)
        .order('display_name', { ascending: true })
        .limit(8),
    ]);

    if (nameResult.error) throw nameResult.error;
    if (walletResult.error) throw walletResult.error;

    const profiles = [...(nameResult.data || []), ...(walletResult.data || [])];
    const uniqueProfiles = Array.from(new Map(profiles.map((profile) => [profile.wallet_address, profile])).values());

    return uniqueProfiles.slice(0, 8).map(mapProfileRow);
  },

  upsertProfile: async (input: Partial<User>, avatarMutation: MediaMutation = KEEP_MEDIA): Promise<User> => {
    const errors = validateProfile(input);
    if (errors.length > 0) throw new Error(errors[0].message);

    const supabase = getSupabaseBrowserClient();
    const profileId = await getAuthenticatedProfileId();
    if (!profileId) throw new Error('Authentication required.');

    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    if (profileError) throw profileError;

    let uploadedAvatar: string | null = null;
    if (avatarMutation.type === 'replace') {
      uploadedAvatar = await mediaService.uploadProfileAvatar(avatarMutation.blob);
    }

    const nextAvatar =
      avatarMutation.type === 'replace'
        ? uploadedAvatar
        : avatarMutation.type === 'remove'
          ? null
          : currentProfile.avatar;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar: nextAvatar,
        bio: input.bio || null,
        display_name: input.displayName || '',
        job_title: input.jobTitle || '',
        telegram_handle: input.telegramHandle || null,
        twitter_handle: input.twitterHandle || null,
        username: input.username?.trim().toLowerCase() || null,
      })
      .eq('id', profileId)
      .select('*')
      .single();

    if (error) {
      await cleanupReplacedMedia(uploadedAvatar);
      // 23505 = unique_violation; the only unique constraint reachable from
      // this update is the username index.
      if (error.code === '23505') {
        throw new Error('That username is already taken. Please pick another one.');
      }
      throw error;
    }

    if (currentProfile.avatar !== nextAvatar) {
      await cleanupReplacedMedia(currentProfile.avatar);
    }

    return mapProfileRow(data);
  },
};
