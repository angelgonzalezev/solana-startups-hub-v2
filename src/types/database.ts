export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Shape returned by the public profile RPCs: the public subset of a profile.
export type PublicProfileRow = {
  avatar: string | null;
  bio: string | null;
  display_name: string;
  job_title: string;
  joined_at: string;
  telegram_handle: string | null;
  twitter_handle: string | null;
  username: string | null;
  wallet_address: string;
};

export type ProfileRow = {
  auth_user_id: string | null;
  avatar: string | null;
  bio: string | null;
  display_name: string;
  id: string;
  job_title: string;
  joined_at: string;
  privy_did: string | null;
  telegram_handle: string | null;
  twitter_handle: string | null;
  updated_at: string;
  username: string | null;
  wallet_address: string;
};

export type UserWalletRow = {
  added_at: string;
  address: string;
  id: string;
  privy_did: string;
  profile_id: string;
  wallet_type: 'embedded' | 'external';
};

export type StartupRow = {
  acquisition_status: string;
  category: string[];
  city: string | null;
  country: string | null;
  country_code: string | null;
  created_at: string;
  description: string;
  discord: string | null;
  domain_verification_status: string;
  featured_until: string | null;
  github: string | null;
  id: string;
  is_raising: boolean;
  latitude: number | null;
  listing_status: string;
  logo: string;
  longitude: number | null;
  mrr: number | null;
  name: string;
  one_liner: string;
  owner_profile_id: string;
  owner_wallet?: string;
  show_mrr: boolean;
  stage: string;
  team: Json;
  team_size: number;
  tech_stack: string[];
  twitter: string;
  updated_at: string;
  verification_rejection_reason: string | null;
  verification_status: string;
  website: string;
  x_verification_status: string;
};

export interface Database {
  public: {
    CompositeTypes: Record<string, never>;
    Enums: Record<string, never>;
    Functions: {
      admin_review_startup: {
        Args: { decision: string; reason?: string | null; reviewer: string; startup_id: string };
        Returns: Json;
      };
      archive_startup: { Args: { startup_id: string }; Returns: Json };
      delete_startup: { Args: { startup_id: string }; Returns: Json };
      get_payment_payer_context: { Args: { in_profile_id: string }; Returns: Json };
      get_profile_by_privy_did: { Args: { in_did: string }; Returns: Json };
      get_accessible_startup: { Args: { startup_id: string }; Returns: Json };
      get_public_profile: { Args: { wallet: string }; Returns: Json };
      get_public_profile_by_username: { Args: { name: string }; Returns: Json };
      get_startup_team_profiles: { Args: { startup_id: string }; Returns: Json[] };
      list_public_startups_by_wallet: { Args: { wallet: string }; Returns: Json[] };
      list_published_startups: {
        Args: {
          acquisition?: string | null;
          categories?: string[] | null;
          raising?: boolean | null;
          search_text?: string | null;
          stages?: string[] | null;
          technologies?: string[] | null;
        };
        Returns: Json[];
      };
      publish_startup: { Args: { startup_id: string }; Returns: Json };
      request_startup_verification: { Args: { startup_id: string }; Returns: Json };
      resolve_privy_profile: { Args: { in_did: string; in_wallets: Json }; Returns: Json };
    };
    Tables: {
      profiles: {
        Insert: {
          auth_user_id?: string | null;
          avatar?: string | null;
          bio?: string | null;
          display_name?: string;
          id?: string;
          job_title?: string;
          joined_at?: string;
          privy_did?: string | null;
          telegram_handle?: string | null;
          twitter_handle?: string | null;
          updated_at?: string;
          wallet_address: string;
        };
        Relationships: [];
        Row: ProfileRow;
        Update: Partial<Omit<ProfileRow, 'id'>>;
      };
      user_wallets: {
        Insert: {
          added_at?: string;
          address: string;
          id?: string;
          privy_did: string;
          profile_id: string;
          wallet_type: 'embedded' | 'external';
        };
        Relationships: [];
        Row: UserWalletRow;
        Update: Partial<Omit<UserWalletRow, 'id'>>;
      };
      startups: {
        Insert: Partial<Omit<StartupRow, 'owner_wallet'>> & {
          name: string;
          one_liner: string;
          owner_profile_id: string;
        };
        Relationships: [];
        Row: Omit<StartupRow, 'owner_wallet'>;
        Update: Partial<Omit<StartupRow, 'id' | 'owner_profile_id' | 'owner_wallet'>>;
      };
    };
    Views: Record<string, never>;
  };
}
