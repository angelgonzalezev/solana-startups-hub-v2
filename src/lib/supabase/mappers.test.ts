import { describe, expect, it } from 'vitest';
import { mapProfileRow, mapStartupRow } from './mappers';
import type { ProfileRow, StartupRow } from '@/types/database';

const profileRow: ProfileRow = {
  auth_user_id: 'auth-user',
  avatar: null,
  bio: 'Builder',
  display_name: 'Ada Sol',
  id: 'profile-id',
  job_title: 'Founder',
  joined_at: '2026-01-01T00:00:00Z',
  privy_did: 'did:privy:test-user',
  telegram_handle: null,
  twitter_handle: 'adasol',
  updated_at: '2026-01-01T00:00:00Z',
  username: 'adasol',
  wallet_address: '11111111111111111111111111111111',
};

const startupRow: StartupRow = {
  acquisition_status: 'not_open',
  category: ['Infra'],
  city: 'Madrid',
  country: 'Spain',
  country_code: 'ES',
  created_at: '2026-01-01T00:00:00Z',
  description: 'Description',
  discord: null,
  domain_verification_status: 'verified',
  featured_until: null,
  github: null,
  id: 'startup-id',
  is_raising: true,
  latitude: 40.416782,
  listing_status: 'published',
  logo: '',
  longitude: -3.703507,
  mrr: null,
  name: 'Solana Startup',
  one_liner: 'A useful startup.',
  owner_profile_id: 'profile-id',
  owner_wallet: profileRow.wallet_address,
  show_mrr: false,
  stage: 'MVP',
  team: [
    { role: 'Founder', walletAddress: profileRow.wallet_address },
    { invalid: true },
  ],
  team_size: 1,
  tech_stack: ['Rust'],
  twitter: 'https://x.com/startup',
  updated_at: '2026-01-02T00:00:00Z',
  verification_rejection_reason: null,
  verification_status: 'verified',
  website: 'https://example.com',
  x_verification_status: 'verified',
};

describe('Supabase mappers', () => {
  it('maps nullable profile fields to the existing domain model', () => {
    expect(mapProfileRow(profileRow)).toEqual({
      avatar: undefined,
      bio: 'Builder',
      displayName: 'Ada Sol',
      jobTitle: 'Founder',
      joinedAt: '2026-01-01T00:00:00Z',
      telegramHandle: undefined,
      twitterHandle: 'adasol',
      username: 'adasol',
      walletAddress: profileRow.wallet_address,
    });
  });

  it('redacts missing MRR and discards malformed team members', () => {
    const startup = mapStartupRow(startupRow);
    expect(startup.mrr).toBeUndefined();
    expect(startup.ownerWallet).toBe(profileRow.wallet_address);
    expect(startup.team).toEqual([{ role: 'Founder', walletAddress: profileRow.wallet_address }]);
  });

  it('maps the location fields', () => {
    const startup = mapStartupRow(startupRow);
    expect(startup.city).toBe('Madrid');
    expect(startup.country).toBe('Spain');
    expect(startup.countryCode).toBe('ES');
    expect(startup.latitude).toBe(40.416782);
    expect(startup.longitude).toBe(-3.703507);

    const legacy = mapStartupRow({ ...startupRow, city: null, country: null, latitude: null, longitude: null });
    expect(legacy.city).toBeUndefined();
    expect(legacy.latitude).toBeUndefined();
  });
});
