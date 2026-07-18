import { getAuthenticatedProfileId } from '@/lib/auth/tokenBridge';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isStartupRow, mapStartupRow } from '@/lib/supabase/mappers';
import { validateStartup } from '@/utils/validation';
import type { AcquisitionStatus, Startup, StartupStage, TeamMember } from '@/interface/startup';
import type { Json, StartupRow } from '@/types/database';
import { KEEP_MEDIA, type MediaMutation } from '@/interface/media';
import { mediaService } from '@/services/mediaService';

export type StartupFilters = {
  acquisitionStatus?: AcquisitionStatus;
  category?: string[];
  isRaising?: boolean;
  search?: string;
  stage?: StartupStage[];
  techStack?: string[];
};

const getCurrentProfile = async () => {
  const profileId = await getAuthenticatedProfileId();
  if (!profileId) throw new Error('Authentication required.');

  const { data, error } = await getSupabaseBrowserClient().from('profiles').select('*').eq('id', profileId).single();
  if (error) throw error;
  return data;
};

const toEditableRow = (input: Partial<Startup>) => ({
  acquisition_status: input.acquisitionStatus,
  category: input.category,
  city: input.city ?? null,
  country: input.country ?? null,
  country_code: input.countryCode ?? null,
  description: input.description,
  discord: input.discord || null,
  github: input.github || null,
  is_raising: input.isRaising,
  latitude: input.latitude ?? null,
  longitude: input.longitude ?? null,
  mrr: input.mrr ?? null,
  name: input.name,
  one_liner: input.oneLiner,
  show_mrr: input.showMrr,
  stage: input.stage,
  team: input.team as unknown as Json,
  team_size: input.teamSize,
  tech_stack: input.techStack,
  twitter: input.twitter,
  website: input.website,
});

const normalizeTeam = (
  team: TeamMember[] | undefined,
  owner: { avatar: string | null; display_name: string; job_title: string; wallet_address: string },
): TeamMember[] => {
  const ownerMember: TeamMember = {
    role: 'Founder',
    walletAddress: owner.wallet_address,
  };
  if (owner.avatar) ownerMember.avatar = owner.avatar;
  if (owner.display_name) ownerMember.displayName = owner.display_name;
  if (owner.job_title) ownerMember.jobTitle = owner.job_title;

  const membersByWallet = new Map<string, TeamMember>([[owner.wallet_address, ownerMember]]);

  for (const member of team || []) {
    if (!member.walletAddress) continue;
    const existing = membersByWallet.get(member.walletAddress);
    membersByWallet.set(member.walletAddress, {
      ...existing,
      ...member,
      role: member.role.trim() || existing?.role || 'Collaborator',
    });
  }

  return Array.from(membersByWallet.values());
};

const cleanupReplacedMedia = async (path?: string | null) => {
  try {
    await mediaService.deleteManagedObject(path);
  } catch (error) {
    console.error('Unable to remove replaced startup media:', error);
  }
};

const mapRpcStartup = (value: Json | null, ownerWallet?: string): Startup | null => {
  if (!isStartupRow(value)) return null;
  return mapStartupRow(value, ownerWallet);
};

export const startupService = {
  listPublishedStartups: async (filters: StartupFilters): Promise<Startup[]> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('list_published_startups', {
      acquisition: filters.acquisitionStatus || null,
      categories: filters.category || null,
      raising: filters.isRaising ?? null,
      search_text: filters.search || null,
      stages: filters.stage || null,
      technologies: filters.techStack || null,
    });

    if (error) throw error;
    return (data || []).flatMap((row) => {
      const startup = mapRpcStartup(row);
      return startup ? [startup] : [];
    });
  },

  // Works without a session: published startups the wallet owns or collaborates
  // on, for the public /u/<wallet> profile page.
  listPublicStartupsByWallet: async (walletAddress: string): Promise<Startup[]> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('list_public_startups_by_wallet', {
      wallet: walletAddress,
    });

    if (error) throw error;
    return (data || []).flatMap((row) => {
      const startup = mapRpcStartup(row);
      return startup ? [startup] : [];
    });
  },

  getAccessibleStartupById: async (id: string): Promise<Startup | null> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('get_accessible_startup', { startup_id: id });
    if (error) throw error;
    return mapRpcStartup(data);
  },

  // Lightweight ownership check for onboarding: how many startups the current
  // user has, without fetching the rows.
  countStartupsByOwner: async (): Promise<number> => {
    const profileId = await getAuthenticatedProfileId();
    if (!profileId) return 0;

    const { count, error } = await getSupabaseBrowserClient()
      .from('startups')
      .select('id', { count: 'exact', head: true })
      .eq('owner_profile_id', profileId);

    if (error) throw error;
    return count ?? 0;
  },

  listStartupsByOwner: async (): Promise<Startup[]> => {
    const profile = await getCurrentProfile();
    const { data, error } = await getSupabaseBrowserClient()
      .from('startups')
      .select('*')
      .eq('owner_profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as StartupRow[]).map((row) => mapStartupRow(row, profile.wallet_address));
  },

  createStartup: async (input: Partial<Startup>, logoMutation: MediaMutation = KEEP_MEDIA): Promise<Startup> => {
    const errors = validateStartup(input);
    if (errors.length > 0) throw new Error(errors[0].message);

    const profile = await getCurrentProfile();
    const startupId = crypto.randomUUID();
    let uploadedLogo: string | null = null;

    if (logoMutation.type === 'replace') {
      uploadedLogo = await mediaService.uploadStartupLogo(startupId, logoMutation.blob);
    }

    const logo =
      logoMutation.type === 'replace' ? uploadedLogo || '' : logoMutation.type === 'remove' ? '' : input.logo || '';
    const { data, error } = await getSupabaseBrowserClient()
      .from('startups')
      .insert({
        ...toEditableRow(input),
        id: startupId,
        logo,
        name: input.name || '',
        one_liner: input.oneLiner || '',
        owner_profile_id: profile.id,
        team: normalizeTeam(input.team, profile) as unknown as Json,
      })
      .select('*')
      .single();

    if (error) {
      await cleanupReplacedMedia(uploadedLogo);
      throw error;
    }
    return mapStartupRow(data, profile.wallet_address);
  },

  updateStartup: async (
    id: string,
    input: Partial<Startup>,
    logoMutation: MediaMutation = KEEP_MEDIA,
  ): Promise<Startup> => {
    const errors = validateStartup(input);
    if (errors.length > 0) throw new Error(errors[0].message);

    const profile = await getCurrentProfile();
    const supabase = getSupabaseBrowserClient();
    const { data: currentStartup, error: currentError } = await supabase
      .from('startups')
      .select('*')
      .eq('id', id)
      .single();
    if (currentError) throw currentError;

    let uploadedLogo: string | null = null;
    if (logoMutation.type === 'replace') {
      uploadedLogo = await mediaService.uploadStartupLogo(id, logoMutation.blob);
    }

    const nextLogo =
      logoMutation.type === 'replace' ? uploadedLogo || '' : logoMutation.type === 'remove' ? '' : currentStartup.logo;

    const { data, error } = await supabase
      .from('startups')
      .update({ ...toEditableRow(input), logo: nextLogo, team: normalizeTeam(input.team, profile) as unknown as Json })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      await cleanupReplacedMedia(uploadedLogo);
      throw error;
    }

    if (currentStartup.logo !== nextLogo) {
      await cleanupReplacedMedia(currentStartup.logo);
    }

    return mapStartupRow(data, profile.wallet_address);
  },

  archiveStartup: async (id: string): Promise<Startup> => {
    const profile = await getCurrentProfile();
    const { data, error } = await getSupabaseBrowserClient().rpc('archive_startup', { startup_id: id });
    if (error) throw error;
    const startup = mapRpcStartup(data, profile.wallet_address);
    if (!startup) throw new Error('Invalid startup response.');
    return startup;
  },

  // Permanent deletion; the RPC only accepts archived startups owned by the
  // caller, so archiving stays the mandatory first step.
  deleteStartup: async (id: string): Promise<void> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('delete_startup', { startup_id: id });
    if (error) throw error;
    // The row is gone; remove its managed logo from storage afterwards. Team
    // avatars are profile media and stay with their owners.
    if (isStartupRow(data)) await cleanupReplacedMedia(data.logo);
  },

  publishStartup: async (id: string): Promise<Startup> => {
    const profile = await getCurrentProfile();
    const { data, error } = await getSupabaseBrowserClient().rpc('publish_startup', { startup_id: id });
    if (error) throw error;
    const startup = mapRpcStartup(data, profile.wallet_address);
    if (!startup) throw new Error('Invalid startup response.');
    return startup;
  },
};
