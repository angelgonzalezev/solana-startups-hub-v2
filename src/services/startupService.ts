import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isStartupRow, mapStartupRow } from '@/lib/supabase/mappers';
import { validateStartup } from '@/utils/validation';
import type { AcquisitionStatus, Startup, StartupStage } from '@/interface/startup';
import type { Json, StartupRow } from '@/types/database';

export type StartupFilters = {
  acquisitionStatus?: AcquisitionStatus;
  category?: string[];
  isRaising?: boolean;
  search?: string;
  stage?: StartupStage[];
  techStack?: string[];
};

const getCurrentProfile = async () => {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required.');

  const { data, error } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).single();
  if (error) throw error;
  return data;
};

const toEditableRow = (input: Partial<Startup>) => ({
  acquisition_status: input.acquisitionStatus,
  category: input.category,
  description: input.description,
  discord: input.discord || null,
  github: input.github || null,
  is_raising: input.isRaising,
  logo: input.logo,
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

  getStartupById: async (id: string): Promise<Startup | null> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('get_accessible_startup', { startup_id: id });
    if (error) throw error;
    return mapRpcStartup(data);
  },

  getAccessibleStartupById: async (id: string): Promise<Startup | null> => {
    const { data, error } = await getSupabaseBrowserClient().rpc('get_accessible_startup', { startup_id: id });
    if (error) throw error;
    return mapRpcStartup(data);
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

  createStartup: async (input: Partial<Startup>): Promise<Startup> => {
    const errors = validateStartup(input);
    if (errors.length > 0) throw new Error(errors[0].message);

    const profile = await getCurrentProfile();
    const { data, error } = await getSupabaseBrowserClient()
      .from('startups')
      .insert({
        ...toEditableRow(input),
        name: input.name || '',
        one_liner: input.oneLiner || '',
        owner_profile_id: profile.id,
        team: (input.team || [{ role: 'Founder', walletAddress: profile.wallet_address }]) as unknown as Json,
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapStartupRow(data, profile.wallet_address);
  },

  updateStartup: async (id: string, input: Partial<Startup>): Promise<Startup> => {
    const errors = validateStartup(input);
    if (errors.length > 0) throw new Error(errors[0].message);

    const profile = await getCurrentProfile();
    const { data, error } = await getSupabaseBrowserClient()
      .from('startups')
      .update(toEditableRow(input))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
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

  publishStartup: async (id: string): Promise<Startup> => {
    const profile = await getCurrentProfile();
    const { data, error } = await getSupabaseBrowserClient().rpc('publish_startup', { startup_id: id });
    if (error) throw error;
    const startup = mapRpcStartup(data, profile.wallet_address);
    if (!startup) throw new Error('Invalid startup response.');
    return startup;
  },
};
